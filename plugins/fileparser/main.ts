import { applyMetadata, Plugin } from "../../types/plugin";
import { SceneOutput } from "../../types/scene";

import { MySceneContext } from "./types";
import { dateToTimestamp, matchElement } from "./utils";
import { findAndLoadSceneConfig } from "./config";

import info from "./info.json";

const handler: Plugin<MySceneContext, SceneOutput> = async (ctx) => {
  const { args, scenePath, $logger, $path, $throw } = ctx;

  if (!scenePath) $throw("Uh oh. You shouldn't use the plugin for this type of event");

  const sceneName = $path.parse(scenePath).name;

  const cfg = await findAndLoadSceneConfig(ctx);
  if (!cfg) {
    $logger.warn(
      `No configuration found in the scene directory or a parent => only 'release date' will be parsed.`
    );
  }

  function parseReleaseDate(): Partial<{ releaseDate: number }> {
    if (args.parseDate === false) return {};

    const dateFromName = dateToTimestamp(ctx, sceneName);
    if (dateFromName) {
      $logger.verbose(`Found date in scene name: ${new Date(dateFromName).toLocaleDateString()}`);
      return { releaseDate: dateFromName };
    }

    $logger.verbose("Could not find a date.");
    return {};
  }

  function parseName(): Partial<{ name: string }> {
    if (!cfg || !cfg.nameMatcher) return {};

    const matched = matchElement(ctx, cfg.nameMatcher);
    if (matched) {
      $logger.verbose(`Matched name: ${matched}`);
      return { name: matched.toString().trim() };
    }

    $logger.verbose(`Found no name.`);
    return {};
  }

  function parseStudio(): Partial<{ studio: string }> {
    if (!cfg || !cfg.studioMatcher) return {};

    const matched = matchElement(ctx, cfg.studioMatcher);
    if (matched) {
      $logger.verbose(`Matched studio: ${matched}`);
      return { studio: matched.toString().trim() };
    }

    $logger.verbose(`Found no studio.`);
    return {};
  }

  function parseActors(): Partial<{ actors: string[] }> {
    if (!cfg || !cfg.actorsMatcher) return {};

    const matched = matchElement(ctx, cfg.actorsMatcher);
    if (matched) {
      $logger.verbose(`Matched actor(s): ${matched}`);
      return { actors: matched };
    }

    $logger.verbose(`Found no actor.`);
    return {};
  }

  function parseMovie(): Partial<{ movie: string }> {
    if (!cfg || !cfg.movieMatcher) return {};

    const matched = matchElement(ctx, cfg.movieMatcher);
    if (matched) {
      $logger.verbose(`Matched movie: ${matched}`);
      return { movie: matched.toString().trim() };
    }

    $logger.verbose(`Found no movie.`);
    return {};
  }

  function parseLabels(): Partial<{ labels: string[] }> {
    if (!cfg || !cfg.labelsMatcher) return {};

    const matched = matchElement(ctx, cfg.labelsMatcher);

    if (matched) {
      $logger.verbose(`Matched label(s): ${matched}`);
      return { labels: matched };
    }

    $logger.verbose(`Found no label.`);
    return {};
  }

  const sceneOutput: SceneOutput = {
    ...parseReleaseDate(),
    ...parseStudio(),
    ...parseName(),
    ...parseActors(),
    ...parseMovie(),
    ...parseLabels(),
  };

  if (args.dry === true) {
    $logger.info(`dry mode. Would have returned: ${sceneOutput}`);
    return {};
  } else {
    if (Object.keys(sceneOutput).length) {
      $logger.info(`Successfully matched scene: ${sceneOutput.name}`);
    } else {
      $logger.info(`Could not match anything for scene: ${sceneName}`);
    }
    return sceneOutput;
  }
};

handler.requiredVersion = ">=0.27.0";

applyMetadata(handler, info);

module.exports = handler;

export default handler;
