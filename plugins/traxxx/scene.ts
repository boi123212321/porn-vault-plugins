import { SceneOutput } from "../../types/scene";
import { Api, SceneResult } from "./api";
import { MySceneContext, MyValidatedSceneContext } from "./types";
import { dateToTimestamp, timestampToString, slugify, validateSceneArgs } from "./util";
import levenshtein from "./levenshtein";

enum MatchResult {
  OK,
  NOK,
  DISABLED,
}

export class SceneExtractor {
  ctx: MyValidatedSceneContext;
  scene?: SceneResult.Scene;
  api: Api;

  /**
   * @param ctx - plugin context
   * @param input - extractor input
   * @param input.scene - the matched channel
   */
  constructor(
    ctx: MyValidatedSceneContext,
    {
      traxxScene,
    }: {
      traxxScene?: SceneResult.Scene;
    }
  ) {
    this.ctx = ctx;
    this.api = new Api(ctx);
    this.scene = traxxScene;
  }

  getName(): Partial<{ name: string }> {
    const name = this.scene?.title;
    if (!name) {
      return {};
    }

    return { name };
  }

  getDescription(): Partial<{ description: string }> {
    const description = this.scene?.description;
    if (!description) {
      return {};
    }

    return { description };
  }

  getReleaseDate(): Partial<{ releaseDate: number }> {
    if (!this.scene?.date) {
      return {};
    }

    const releaseDate = new Date(this.scene?.date).getTime();

    return { releaseDate };
  }

  getStudio(): Partial<{ studio: string }> {
    const studio = this.scene?.entity?.name;
    if (!studio) {
      return {};
    }

    return { studio };
  }

  getActors(): Partial<{ actors: string[] }> {
    const actorsArray = this.scene?.actors;

    if (!actorsArray) {
      return {};
    }

    const actors = actorsArray
      .map((actor) => {
        if (actor.gender !== "female") {
          return "";
        }

        return actor.name;
      })
      .filter((actorName) => {
        return actorName !== "";
      });

    return { actors };
  }

  async getThumbnail(): Promise<Partial<{ thumbnail: string }>> {
    const poster = this.scene?.poster?.path;
    if (!poster) {
      return {};
    }

    let thumbnail = "";
    const name = this.getName().name as string;
    const mediaLocation = this.ctx.args?.server.mediaLocation;
    if (mediaLocation) {
      thumbnail = this.ctx.args.dry
        ? `_would_have_created_${poster}`
        : await this.ctx.$createLocalImage(`${mediaLocation}${poster}`, name, true);
    } else {
      thumbnail = this.ctx.args.dry
        ? `_would_have_created_${poster}`
        : await this.ctx.$createImage(poster, name, true);
    }

    return {
      thumbnail,
    };
  }

  getCustom(): Partial<SceneResult.Scene & { traxxx: string }> {
    const scene = this.scene;
    return {
      ...scene,
      traxxx: `${this.api.apiURL}/scene/${scene?.id}/`,
    };
  }
}

export default async (initialContext: MySceneContext): Promise<SceneOutput> => {
  const { $logger, $formatMessage, $throw, scenePath, sceneName, scene, data } = initialContext;

  try {
    const validatedArgs = validateSceneArgs(initialContext);
    if (validatedArgs) {
      initialContext.args = validatedArgs;
    }
  } catch (err) {
    $throw(err);
    return {};
  }

  // Scene Output from other plugins
  const passThroughSceneInfo = data;
  const notFoundResult: SceneOutput = {};

  // Can assert all properties exist, since we just validated them above
  const ctx = initialContext as MyValidatedSceneContext;
  const args = ctx.args;

  const api = new Api(ctx);

  if (args.scenes?.missingLabel) {
    notFoundResult.labels = [];
    notFoundResult.labels.push(args.scenes.missingLabel);
  }

  ctx.$logger.info(`Trying to match "${sceneName}"`);

  const queries = [] as string[];

  // Studio from other plugins will be a usable text value
  if (passThroughSceneInfo.studio) {
    const slugifiedStudio = slugify(passThroughSceneInfo.studio);
    const channel = await api.getChannel(slugifiedStudio);

    if (channel?.data?.entity?.name) {
      queries.push(channel.data.entity.name);
      notFoundResult.studio = channel.data.entity.name;
    } else {
      queries.push(slugifiedStudio);
    }
  }

  // Use the scene name from other plugins as it may be clean and formated
  if ("name" in passThroughSceneInfo) scene.name = passThroughSceneInfo.name;
  queries.push(scene.name);

  // Check that we actually have something to search with.
  // (Purposefully ignore the date, since that cannot reliable identify a scene)
  if (!queries.flat().filter(Boolean).join("")) {
    $logger.warn("Did not have any parameters to do primary search");
    return {};
  }

  // Use releaseDate from other plugins
  if (passThroughSceneInfo?.releaseDate) scene.releaseDate = passThroughSceneInfo.releaseDate;

  if (!scene.releaseDate || Number.isNaN(scene.releaseDate)) {
    scene.releaseDate = dateToTimestamp(ctx, scenePath);
  }

  if (scene.releaseDate && !Number.isNaN(scene.releaseDate)) {
    queries.push(timestampToString(scene.releaseDate));
  }

  const initialQuery = queries.flat().filter(Boolean).join(" ");

  $logger.debug(initialQuery);
  const searchPromise = api
    .getScenes(initialQuery)
    .then((res) => res?.data?.scenes)
    .catch((err) => {
      ctx.$throw(err);
      return undefined;
    });

  const scenes = await searchPromise;

  if (!scenes || scenes.length === 0) {
    $logger.info(`Could not find scene "${sceneName}" in TRAXXX`);
    if (args.dry) {
      $logger.info(`Is 'dry' mode, would've returned: ${$formatMessage(notFoundResult)}`);
      return {};
    }
    return notFoundResult;
  }

  let sceneHighScore = 5000;
  let sceneId;
  $logger.debug(`Found ${scenes.length} scenes "${initialQuery}" in TRAXXX`);
  scenes.forEach((result) => {
    if (!result) return;

    let matchstudio = MatchResult.OK;
    // The studio needs to match what is passed.
    if (args.scenes?.matchStudio) {
      if (passThroughSceneInfo.studio) {
        if (
          slugify(result.entity.name.toLowerCase()) ===
          slugify(passThroughSceneInfo.studio.toLowerCase())
        ) {
          notFoundResult.studio = result.entity.name;
          matchstudio = MatchResult.OK;
          $logger.debug(
            `Matched Studio "${result?.entity?.name}" with "${passThroughSceneInfo.studio}"`
          );
        } else {
          matchstudio = MatchResult.DISABLED;
        }

        $logger.debug(
          `Match Studio "${result?.entity?.name}" with "${passThroughSceneInfo.studio}"`
        );
      } else {
        // Nothing to validate
        matchstudio = MatchResult.NOK;
      }
    }

    let matchactors = MatchResult.OK; // If match enable and no passThroughSceneInfo.actors it will be null.
    if (args.scenes?.matchActors) {
      if (passThroughSceneInfo.actors) {
        const actorsArray = passThroughSceneInfo.actors;

        const resultActors = result.actors.map((actor) => {
          return actor.name.toLowerCase() || "";
        });

        $logger.debug(
          `Testing "${$formatMessage(actorsArray)}" with "${$formatMessage(resultActors)}"`
        );
        actorsArray.forEach((actorName) => {
          if (!resultActors.includes(actorName.toLowerCase())) {
            matchactors = MatchResult.DISABLED;
          }
        });
      } else {
        matchactors = MatchResult.NOK;
      }
    }

    const resultDate = result?.date ? result?.date.split("T")[0] : "";
    const date = timestampToString(scene.releaseDate);

    // Test the title
    const resultName = slugify(result.title, true);
    const name = slugify(scene.name, true);

    const found = name === "" ? 0 : (levenshtein(name, resultName) as number);
    $logger.debug(`Testing "${name}" with "${resultName}" ${found}`);

    if (
      found < sceneHighScore &&
      matchstudio !== MatchResult.DISABLED &&
      (matchactors === MatchResult.NOK || matchactors === MatchResult.OK)
    ) {
      sceneHighScore = found;
      sceneId = result.id;
      $logger.debug(`matched "${name}" with "${resultName}" ${found}`);
    }

    $logger.debug(`Testing "${date}" with "${resultDate}"`);
    if (resultDate && date === resultDate) {
      $logger.debug(`Date match "${name}" with "${resultName}"`);
      $logger.debug(`matchstudio "${matchstudio}"`);
      $logger.debug(`matchactors "${matchactors}"`);
      if (
        matchstudio !== MatchResult.DISABLED &&
        (matchactors === MatchResult.NOK || matchactors === MatchResult.OK)
      ) {
        sceneHighScore = 0;
        sceneId = result.id;
        $logger.debug(`Date match "${name}" with "${resultName}"`);
      }
    }
  });
  const maxLevenshteinDistance = args.scenes.maxLevenshteinDistance;
  if (!sceneId || sceneHighScore > maxLevenshteinDistance) {
    if (args.dry) {
      $logger.info(`Is 'dry' mode, would've returned: ${$formatMessage(notFoundResult)}`);
      return {};
    }
    return notFoundResult;
  }
  $logger.debug(`traxxScene: ${$formatMessage(sceneId)}`);

  const traxxScene = (await api.getScene(sceneId)).data.scene;

  $logger.debug(`traxxScene: ${$formatMessage(traxxScene)}`);

  const sceneExtractor = new SceneExtractor(ctx, {
    traxxScene,
  });

  const result: SceneOutput = {
    ...sceneExtractor.getName(),
    ...sceneExtractor.getDescription(),
    ...sceneExtractor.getReleaseDate(),
    ...sceneExtractor.getStudio(),
    ...sceneExtractor.getActors(),
    ...(await sceneExtractor.getThumbnail()),
    custom: sceneExtractor.getCustom(),
  };

  result.labels = [];

  if (args.dry) {
    $logger.info(`Is 'dry' mode, would've returned: ${$formatMessage(result)}`);
    return {};
  }

  $logger.info("Successfully matched scene:");

  return result;
};
