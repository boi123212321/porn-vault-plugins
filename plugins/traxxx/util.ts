import {
  ActorSettings,
  DeepPartial,
  MyActorArgs,
  MyActorContext,
  MySceneArgs,
  MySceneContext,
  MyStudioArgs,
  MyStudioContext,
  MyValidatedSceneContext,
  MyValidatedStudioContext,
  SceneSettings,
  ServerSettings,
  StudioSettings,
} from "./types";

export const hasProp = (target: unknown, prop: string): boolean => {
  return !!target && typeof target === "object" && Object.hasOwnProperty.call(target, prop);
};

const DEFAULT_ACTOR_SETTINGS: ActorSettings = {
  missingLabel: "",
};

const DEFAULT_SCENE_SETTINGS: SceneSettings = {
  missingLabel: "",
  matchActors: false,
  matchStudio: false,
  maxLevenshteinDistance: 10,
};

const DEFAULT_SERVER_SETTINGS: ServerSettings = {
  URL: "https://traxxx.me",
  limit: 100,
  mediaLocation: "",
};

const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  channelPriority: true,
  uniqueNames: true,
  channelSuffix: "",
  networkSuffix: " (Network)",
  whitelist: [],
  blacklist: [],
  whitelistOverride: [],
  blacklistOverride: [],
  mergeAliases: true,
};

/**
 * @param ctx - plugin context
 * @returns the context with defaults args when missing, or throws
 */
export const validateStudioArgs = ({
  args,
  $formatMessage,
  $throw,
  $logger,
  studioName,
}: MyStudioContext): MyStudioArgs | void => {
  let validatedArgs: DeepPartial<MyStudioArgs> | undefined;
  if (args && typeof args === "object") {
    // Copy object
    validatedArgs = { ...args };
  }

  if (!studioName || typeof studioName !== "string") {
    return $throw(`Missing "studioName", cannot run plugin`);
  }

  if (!validatedArgs || typeof validatedArgs !== "object") {
    return $throw(`Missing args, cannot run plugin`);
  }

  if (!validatedArgs.studios || typeof validatedArgs.studios !== "object") {
    $logger.verbose(
      `Missing "args.studios, setting to default: `,
      $formatMessage(DEFAULT_STUDIO_SETTINGS)
    );
    validatedArgs.studios = DEFAULT_STUDIO_SETTINGS;
  } else {
    // Copy object
    validatedArgs.studios = { ...validatedArgs.studios };
  }

  const studios = validatedArgs.studios;

  [
    { prop: "channelPriority", type: "boolean" },
    { prop: "uniqueNames", type: "boolean" },
    { prop: "channelSuffix", type: "string" },
    { prop: "networkSuffix", type: "string" },
    { prop: "mergeAliases", type: "boolean" },
  ].forEach((propCheck) => {
    if (!hasProp(studios, propCheck.prop)) {
      $logger.verbose(
        `Missing "args.studios.${propCheck.prop}", setting to default: "${
          DEFAULT_STUDIO_SETTINGS[propCheck.prop]
        }"`
      );
      studios[propCheck.prop] = DEFAULT_STUDIO_SETTINGS[propCheck.prop];
    } else if (typeof studios[propCheck.prop] !== propCheck.type) {
      return $throw(
        `"args.studios.${propCheck.prop}" is not a ${propCheck.type}, cannot run plugin"`
      );
    }
  });

  // One suffix can be an empty string, but both cannot be at the same time.
  // They cannot have the same value in general, otherwise it would not fix the conflict
  if (validatedArgs.studios.channelSuffix === validatedArgs.studios.networkSuffix) {
    return $throw(
      `"args.studios.channelSuffix" and "args.studios.networkSuffix" are identical, cannot run plugin`
    );
  }

  ["whitelist", "blacklist", "whitelistOverride", "blacklistOverride"].forEach((arrayProp) => {
    const arr = studios[arrayProp];
    if (!hasProp(studios, arrayProp)) {
      $logger.verbose(
        `Missing "args.studios.${arrayProp}", setting to default: "${DEFAULT_STUDIO_SETTINGS[arrayProp]}"`
      );
      studios[arrayProp] = DEFAULT_STUDIO_SETTINGS[arrayProp];
    } else if (!Array.isArray(arr) || !arr.every((prop) => typeof prop === "string")) {
      return $throw(
        `"args.studios.${arrayProp}" does not only contain strings, cannot run plugin"`
      );
    }
  });

  const server = validateServerArgs(validatedArgs.server, $throw, $logger, $formatMessage);
  if (typeof server === "object") {
    validatedArgs.server = server;
  }

  // At the end of this function, validatedArgs will have type MyStudioArgs
  // since we merged defaults
  return validatedArgs as MyStudioArgs;
};

/**
 * @param ctx - plugin context
 * @returns the context with defaults args when missing, or throws
 */
export const validateActorArgs = ({
  args,
  $formatMessage,
  $throw,
  $logger,
  actorName,
}: MyActorContext): MyActorArgs | void => {
  let validatedArgs: DeepPartial<MyActorArgs> | undefined;
  if (args && typeof args === "object") {
    // Copy object
    validatedArgs = { ...args };
  }

  if (!actorName || typeof actorName !== "string") {
    return $throw(`Missing "actorName", cannot run plugin`);
  }

  if (!validatedArgs || typeof validatedArgs !== "object") {
    return $throw(`Missing args, cannot run plugin`);
  }

  if (!validatedArgs.actors || typeof validatedArgs.actors !== "object") {
    $logger.verbose(
      `Missing "args.actors, setting to default: `,
      $formatMessage(DEFAULT_ACTOR_SETTINGS)
    );
    validatedArgs.actors = DEFAULT_ACTOR_SETTINGS;
  } else {
    // Copy object
    validatedArgs.actors = { ...validatedArgs.actors };
  }

  const actors = validatedArgs.actors;

  [{ prop: "missingLabel", type: "string" }].forEach((propCheck) => {
    if (!hasProp(actors, propCheck.prop)) {
      $logger.verbose(
        `Missing "args.actors.${propCheck.prop}", setting to default: "${
          DEFAULT_ACTOR_SETTINGS[propCheck.prop]
        }"`
      );
      actors[propCheck.prop] = DEFAULT_ACTOR_SETTINGS[propCheck.prop];
    } else if (typeof actors[propCheck.prop] !== propCheck.type) {
      return $throw(
        `"args.actors.${propCheck.prop}" is not a ${propCheck.type}, cannot run plugin"`
      );
    }
  });

  const server = validateServerArgs(validatedArgs.server, $throw, $logger, $formatMessage);
  if (typeof server === "object") {
    validatedArgs.server = server;
  }

  // At the end of this function, validatedArgs will have type MySceneArgs
  // since we merged defaults
  return validatedArgs as MyActorArgs;
};

/**
 * @param ctx - plugin context
 * @returns the context with defaults args when missing, or throws
 */
export const validateSceneArgs = ({
  args,
  $formatMessage,
  $throw,
  $logger,
  scenePath,
  sceneName,
}: MySceneContext): MySceneArgs | void => {
  let validatedArgs: DeepPartial<MySceneArgs> | undefined;
  if (args && typeof args === "object") {
    // Copy object
    validatedArgs = { ...args };
  }

  if (!scenePath || typeof scenePath !== "string") {
    return $throw(`Missing "scenePath", cannot run plugin`);
  }

  if (typeof sceneName !== "string") {
    return $throw(`Missing "sceneName", cannot run plugin`);
  }

  if (!validatedArgs || typeof validatedArgs !== "object") {
    return $throw(`Missing args, cannot run plugin`);
  }

  if (!validatedArgs.scenes || typeof validatedArgs.scenes !== "object") {
    $logger.verbose(
      `Missing "args.scenes, setting to default: `,
      $formatMessage(DEFAULT_SCENE_SETTINGS)
    );
    validatedArgs.scenes = DEFAULT_SCENE_SETTINGS;
  } else {
    // Copy object
    validatedArgs.scenes = { ...validatedArgs.scenes };
  }

  const scenes = validatedArgs.scenes;

  [
    { prop: "missingLabel", type: "string" },
    { prop: "matchStudio", type: "boolean" },
    { prop: "matchActors", type: "boolean" },
    { prop: "maxLevenshteinDistance", type: "number" },
  ].forEach((propCheck) => {
    if (!hasProp(scenes, propCheck.prop)) {
      $logger.verbose(
        `Missing "args.scenes.${propCheck.prop}", setting to default: "${
          DEFAULT_SCENE_SETTINGS[propCheck.prop]
        }"`
      );
      scenes[propCheck.prop] = DEFAULT_SCENE_SETTINGS[propCheck.prop];
    } else if (typeof scenes[propCheck.prop] !== propCheck.type) {
      return $throw(
        `"args.scenes.${propCheck.prop}" is not a ${propCheck.type}, cannot run plugin"`
      );
    }
  });

  const server = validateServerArgs(validatedArgs.server, $throw, $logger, $formatMessage);
  if (typeof server === "object") {
    validatedArgs.server = server;
  }

  // At the end of this function, validatedArgs will have type MySceneArgs
  // since we merged defaults
  return validatedArgs as MySceneArgs;
};

const validateServerArgs = (
  serverSettings: DeepPartial<ServerSettings> | undefined,
  $throw,
  $logger,
  $formatMessage
): DeepPartial<ServerSettings> | void => {
  if (!serverSettings || typeof serverSettings !== "object") {
    $logger.verbose(
      `Missing "args.server, setting to default: `,
      $formatMessage(DEFAULT_SERVER_SETTINGS)
    );
    serverSettings = DEFAULT_SERVER_SETTINGS;
  } else {
    // Copy object
    serverSettings = { ...serverSettings };
  }

  const server = serverSettings;

  [
    { prop: "URL", type: "string" },
    { prop: "limit", type: "number" },
    { prop: "mediaLocation", type: "string" },
  ].forEach((propCheck) => {
    if (!hasProp(server, propCheck.prop)) {
      $logger.verbose(
        `Missing "args.server.${propCheck.prop}", setting to default: "${
          DEFAULT_SERVER_SETTINGS[propCheck.prop]
        }"`
      );
      server[propCheck.prop] = DEFAULT_SERVER_SETTINGS[propCheck.prop];
    } else if (typeof server[propCheck.prop] !== propCheck.type) {
      return $throw(
        `"args.server.${propCheck.prop}" is not a ${propCheck.type}, cannot run plugin"`
      );
    }
  });

  return server;
};

function lowercase(str: string): string {
  return str.toLowerCase();
}

/**
 * @param ctx - plugin context
 * @param name - the studio name from pv
 * @returns the studio name, without our plugin suffixes
 */
export const normalizeStudioName = (ctx: MyValidatedStudioContext, name: string): string => {
  return name
    .replace(ctx.args.studios.channelSuffix, "")
    .replace(ctx.args.studios.networkSuffix, "");
};

/**
 * What type of entity should be returned. Either channel, network, or default:
 * according to user preference (when conflict), or whatever is found (no conflict).
 */
export type EntityPreference = "none" | "channel" | "network";

/**
 * @param ctx - plugin context
 * @param name - the input studio name
 * @returns how to treat the studio: channel, network, or none (according to user args)
 */
export const getEntityPreferenceFromName = (
  ctx: MyValidatedStudioContext,
  name: string
): EntityPreference => {
  let entityPreference: EntityPreference = "none";
  if (ctx.args.studios.channelSuffix && name.endsWith(ctx.args.studios.channelSuffix)) {
    entityPreference = "channel";
  } else if (ctx.args.studios.networkSuffix && name.endsWith(ctx.args.studios.networkSuffix)) {
    entityPreference = "network";
  }
  return entityPreference;
};

/**
 * @param str - the string to strip
 * @returns the string without diacritics
 */
export const stripAccents = (str: string): string =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * @param str - the studio name
 * @param removePunctuation - Optional: Remove punctuation
 * @returns the slugified version of the name for traxxx
 */
export const slugify = (str: string, removePunctuation = false): string => {
  // Newline for every operation for readability
  let res = str.replace(/\s/g, "");
  res = stripAccents(res);
  res = lowercase(res);
  res = res.replace(removePunctuation ? /[.,:;'"]/g : "", "");
  return res;
};

export const isBlacklisted = (ctx: MyValidatedStudioContext, prop: string): boolean => {
  if (ctx.args.studios.whitelist.length) {
    return !ctx.args.studios.whitelist.includes(lowercase(prop));
  }
  return ctx.args.studios.blacklist.includes(lowercase(prop));
};

/**
 * @param ctx - plugin context
 * @param prop - the property to check
 * @returns if the property exists in the data, and has a "real" value
 */
export const propExistsInData = ({ data }: MyValidatedStudioContext, prop: string): boolean => {
  if (!hasProp(data, prop)) {
    return false;
  }
  if (
    data[prop] === undefined ||
    data[prop] === null ||
    (typeof data[prop] === "string" && data[prop].trim() === "") ||
    (Array.isArray(data[prop]) && data[prop].length === 0)
  ) {
    return false;
  }

  return true;
};

/**
 * Checks if the property was already returned by a previous plugin
 *
 * @param ctx - plugin context
 * @param prop - the property to check
 * @returns if the property should not be returned because it already exists in data, and
 * it is override blacklisted
 */
export const isOverrideBlacklisted = (ctx: MyValidatedStudioContext, prop: string): boolean => {
  if (!propExistsInData(ctx, prop)) {
    return false;
  }

  if (ctx.args.studios.whitelistOverride.length) {
    return !ctx.args.studios.whitelistOverride.includes(lowercase(prop));
  }
  return ctx.args.studios.blacklistOverride.includes(lowercase(prop));
};

/**
 * @param ctx - plugin context
 * @param prop - the property to check
 * @returns if the property should not be returned from the plugin
 */
export const suppressProp = (ctx: MyValidatedStudioContext, prop: string): boolean => {
  return isBlacklisted(ctx, prop) || isOverrideBlacklisted(ctx, prop);
};

/**
 * @param timestamp - Timestamp to be converted to date
 * @returns a human friendly date string in YYYY-MM-DD
 */
export function timestampToString(timestamp: number | null) {
  if (timestamp === null) return "";

  const d = new Date(timestamp);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const year = `${d.getFullYear()}`;

  return [year, month, day].join("-");
}

export const dateToTimestamp = (ctx: MyValidatedSceneContext, dateStr: string): number | null => {
  const ddmmyyyy = dateStr.match(/\d\d(?:\s|\.)\d\d(?:\s|\.)\d\d\d\d/);
  const yyyymmdd = dateStr.match(/\d\d\d\d(?:\s|\.)\d\d(?:\s|\.)\d\d/);
  const yymmdd = dateStr.match(/\d\d(?:\s|\.)\d\d(?:\s|\.)\d\d/);

  ctx.$logger.verbose(`Converting date ${JSON.stringify(dateStr)} to timestamp`);

  if (yyyymmdd && yyyymmdd.length) {
    const date = yyyymmdd[0].replace(" ", ".");

    ctx.$logger.verbose("\tSUCCESS: Found => yyyymmdd");

    return ctx.$moment(date, "YYYY-MM-DD").valueOf();
  }
  if (ddmmyyyy && ddmmyyyy.length) {
    const date = ddmmyyyy[0].replace(" ", ".");

    ctx.$logger.verbose("\tSUCCESS: Found => ddmmyyyy");

    return ctx.$moment(date, "DD-MM-YYYY").valueOf();
  }
  if (yymmdd && yymmdd.length) {
    const date = yymmdd[0].replace(" ", ".");

    ctx.$logger.verbose("\tSUCCESS: Found => yymmdd");

    return ctx.$moment(date, "YY-MM-DD").valueOf();
  }

  ctx.$logger.verbose("\tFAILED: Could not find a date");
  return null;
};
