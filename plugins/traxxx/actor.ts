import { ActorOutput } from "../../types/actor";
import { Api, ActorResult } from "./api";
import { MyActorContext, MyValidatedActorContext } from "./types";
import { slugify, validateActorArgs } from "./util";

export class ActorExtractor {
  ctx: MyValidatedActorContext;
  actor?: ActorResult.Actor;
  api: Api;

  /**
   * @param ctx - plugin context
   * @param input - extractor input
   * @param input.scene - the matched channel
   */
  constructor(
    ctx: MyValidatedActorContext,
    {
      actor,
    }: {
      actor?: ActorResult.Actor;
    }
  ) {
    this.ctx = ctx;
    this.api = new Api(ctx);
    this.actor = actor;
  }

  getName(): Partial<{ name: string }> {
    const name = this.actor?.name;
    if (!name) {
      return {};
    }

    return { name };
  }

  getNationality(): Partial<{ nationality: string }> {
    const nationality = this.actor?.birthCountry;
    if (!nationality) {
      return {};
    }
    return { nationality };
  }

  getAge(): Partial<{ bornOn: number }> {
    const dateOfBirth = this.actor?.dateOfBirth as string;
    if (!dateOfBirth) {
      return {};
    }
    const bornOn = new Date(dateOfBirth).getTime();

    return { bornOn };
  }

  getAlias(): Partial<{ aliases: string[] }> {
    const aliases = this.actor?.alias;
    if (!aliases) {
      return {};
    }
    return { aliases };
  }

  async getAvatar(): Promise<Partial<{ avatar: string; thumbnail: string }>> {
    const avatar = this.actor?.avatar?.path;
    if (!avatar) {
      return {};
    }

    let thumbnail = "";
    const name = this.getName().name as string;
    const mediaLocation = this.ctx.args?.server?.mediaLocation;
    if (mediaLocation) {
      thumbnail = this.ctx.args.dry
        ? `_would_have_created_${avatar}`
        : await this.ctx.$createLocalImage(mediaLocation + avatar, name, true);
      this.ctx.$logger.info(`image: ${this.ctx.$formatMessage(mediaLocation + avatar)}`);
    } else {
      thumbnail = this.ctx.args.dry
        ? `_would_have_created_${avatar}`
        : await this.ctx.$createImage(avatar, name, true);
    }

    return {
      avatar: thumbnail,
      thumbnail,
    };
  }

  private _getMeasurements(): Partial<string> {
    const actor = this.actor;
    const bust = `${actor?.bust ? actor.bust : ""}${actor?.cup ? actor.cup : ""}`;

    const measurements = `${bust || ""}${actor?.waist ? `-${actor.waist}` : ""}${
      actor?.hip ? `-${actor.hip}` : ""
    }`;

    return measurements;
  }

  getCustom(): Partial<{}> {
    const actor = this.actor;
    const measurements = this._getMeasurements();

    return {
      gender: actor?.gender,
      "cup size": actor?.cup,
      "eye color": actor?.eyes,
      "hair color": actor?.hairColor,
      "natural boobs": actor?.naturalBoobs,
      measurements,
      height: actor?.height,
      weight: actor?.weight,
      tattoos: actor?.tattoos,
      piercings: actor?.piercings,
      ethnicity: actor?.ethnicity,
      traxxx: `${this.api.apiURL}/actor/${actor?.id}/${actor?.slug}/`,
    };
  }
}

export default async (initialContext: MyActorContext): Promise<ActorOutput> => {
  const { $logger, $formatMessage, $throw, actorName } = initialContext;

  try {
    const validatedArgs = validateActorArgs(initialContext);
    if (validatedArgs) {
      initialContext.args = validatedArgs;
    }
  } catch (err) {
    $throw(err);
    return {};
  }
  const notFoundResult: ActorOutput = {};

  // Can assert all properties exist, since we just validated them above
  const ctx = initialContext as MyValidatedActorContext;
  const args = ctx.args;

  const api = new Api(ctx);

  if (args.actors?.missingLabel) {
    notFoundResult.labels = [];
    notFoundResult.labels.push(args.actors.missingLabel);
  }

  ctx.$logger.info(`Trying to match "${actorName}"`);

  const actors = (await api.getActors(actorName)).data.actors;

  if (!actors) {
    $logger.info(`Could not find actor "${actorName}" in TRAXXX`);
    return notFoundResult;
  }

  let actorsId = 0;
  actors.forEach((actor) => {
    $logger.debug(`Testing "${actor.name}" with "${actorName}"`);
    if (slugify(actor.name) === slugify(actorName)) {
      actorsId = actor.id;
    }
  });

  if (actorsId === 0) {
    $logger.info(`Found ${actors.length} actors "${actorName}" in TRAXXX`);
    return notFoundResult;
  }

  const actor = (await api.getActor(actorsId)).data.actor;

  const actorExtractor = new ActorExtractor(ctx, {
    actor,
  });

  const result: ActorOutput = {
    ...actorExtractor.getName(),
    ...actorExtractor.getNationality(),
    ...actorExtractor.getAge(),
    ...actorExtractor.getAlias(),
    ...(await actorExtractor.getAvatar()),
    custom: actorExtractor.getCustom(),
  };

  result.labels = [];

  if (args.dry) {
    $logger.info(`Is 'dry' mode, would've returned: ${$formatMessage(result)}`);
    return {};
  }

  $logger.debug(`Returned: ${$formatMessage(result)}`);

  return result;
};
