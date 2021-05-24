import { Context } from "../../types/plugin";
import { SceneOutput } from "../../types/scene";
import { MyContext, SceneResult } from "./types";

export const manualTouchChoices = {
  MANUAL_ENTER: "Enter scene details manually, straight into the porn-vault",
  NOTHING: "Do nothing (let the scene be imported with no details)",
  SEARCH: "Search scene details on The Porn Database (TPD)",
};

/**
 * @param answer - string to compare
 * @returns if the answer is a positive confirmation (i.e. "yes")
 */
export const isPositiveAnswer = (answer = ""): boolean =>
  ["y", "yes"].includes(answer.toLowerCase());

/**
 * @param timestamp - Timestamp to be converted to date
 * @returns a human friendly date string in YYYY-MM-DD
 */
export function timestampToString(timestamp: number) {
  const dateNotFormatted = new Date(timestamp);

  let formattedString = dateNotFormatted.getFullYear() + "-";

  if (dateNotFormatted.getMonth() < 9) {
    formattedString += "0";
  }

  formattedString += dateNotFormatted.getMonth() + 1;

  formattedString += "-";

  if (dateNotFormatted.getDate() < 10) {
    formattedString += "0";
  }
  formattedString += dateNotFormatted.getDate();

  return formattedString;
}

export const dateToTimestamp = (ctx: MyContext, dateStr: string): number | null => {
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

/**
 * @param str - String to be cleaned of: "P.O.V." "/[^a-zA-Z0-9'/\\,(){}]/" (i should make this a file of customizable strings to clean? maybe?)
 * @param keepDate - Boolean that identifies if it should clean a string with dates or not | True = does not remove zeros in front of a number from 1 - 9
 * @returns return the string with all of the unwanted characters removed from the string
 */
export function stripStr(str: string, keepDate: boolean = false): string {
  str = str.toString();

  str = str.toLowerCase().replace("'", "");
  str = str.toLowerCase().replace(/P.O.V./gi, "pov");
  if (!keepDate) {
    str = str.toLowerCase().replace(/\b0+/g, "");
  }

  str = str.replace(/[^a-zA-Z0-9'/\\,(){}]/g, " ");

  str = str.replace(/  +/g, " ");
  return str;
}

/**
 * Escapes RegExp reserved characters
 * @param string - the string to escape
 * @returns the string to be used to create a RegExp
 */
export function escapeRegExp(string: string | undefined): string {
  return string?.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&") ?? ""; // $& means the whole matched string
}

/**
 * @param inquirer - the inquire prompting questions
 * @param testingStatus - if should just print test questions and use the param answer
 * @param $logger - logger function
 * @returns the question prompt function
 */
export const createQuestionPrompter = (
  inquirer: Context["$inquirer"],
  testingStatus: boolean | undefined,
  $logger: Context["$logger"]
) => {
  /**
   * @param promptArgs - All of the arguments that are required for prompting a question
   * @returns the result of the question, or the inputted answer for test mode
   */
  const questionAsync = async <T>(
    promptArgs: Record<string, any>
  ): Promise<T | { [name: string]: string }> => {
    if (testingStatus) {
      $logger.info(
        `TESTMODE: ${JSON.stringify(promptArgs.name)} => ${JSON.stringify(promptArgs.testAnswer)}`
      );

      return { [promptArgs.name]: promptArgs.testAnswer };
    }

    return inquirer.prompt(promptArgs);
  };

  return questionAsync;
};

/**
 *
 * @param line - line from the db
 * @returns if the line should not be used
 */
export const ignoreDbLine = (line: string | undefined): boolean => {
  if (!line) {
    return true;
  }

  try {
    const parsed = JSON.parse(line);
    return parsed.$$deleted;
  } catch (err) {
    return true;
  }
};

/**
 * Tries find a scene whose title matches the "ctx.sceneName"
 *
 * @param ctx - plugin context
 * @param sceneList - list of scenes to try to match
 * @param knownActors - actors that we know are in the scene, that could be in the title
 * @param studio - studio that we know the scene is from, that could be in the title
 * @returns the matches scene or null
 */
export const matchSceneResultToSearch = (
  ctx: MyContext,
  sceneList: SceneResult.SlimSceneData[],
  knownActors: string[],
  studio: string | undefined
): SceneResult.SlimSceneData | null => {
  ctx.$logger.verbose(`MATCH: ${sceneList.length} results found`);

  for (const scene of sceneList) {
    ctx.$logger.verbose(
      `MATCH:\tTrying to match TPD title: ${JSON.stringify(scene.title)} --with--> ${JSON.stringify(
        ctx.sceneName
      )}`
    );

    // It is better to search just the title.  We already have the actor and studio.
    let searchedTitle = stripStr(ctx.sceneName).toLowerCase();

    let matchTitle = stripStr(scene.title || "").toLowerCase();
    if (!matchTitle) {
      continue;
    }

    // lets remove the actors from the scenename and the searched title -- We should already know this
    // $log("removing actors name from comparison strings...")
    for (const actor of knownActors) {
      if (actor) {
        searchedTitle = searchedTitle.replace(actor.toLowerCase(), "");
        matchTitle = matchTitle.replace(actor.toLowerCase(), "");
      }
    }

    // lets remove the Studio from the scenename and the searched title -- We should already know this
    if (studio) {
      searchedTitle = searchedTitle.replace(studio.toLowerCase(), "");
      searchedTitle = searchedTitle.replace(studio.toLowerCase().replace(" ", ""), "");

      matchTitle = matchTitle.replace(studio.toLowerCase(), "");
    }

    matchTitle = matchTitle.trim();
    searchedTitle = searchedTitle.trim();

    if (matchTitle) {
      const matchTitleRegex = new RegExp(matchTitle, "i");

      if (searchedTitle !== undefined) {
        if (matchTitleRegex.test(searchedTitle)) {
          ctx.$logger.verbose(
            `MATCH:\t\tSUCCESS: ${JSON.stringify(searchedTitle)} did match to ${JSON.stringify(
              matchTitle
            )}`
          );
          return scene;
        }
      }
    }
  }

  ctx.$logger.error(`MATCH:\tERR: did not find any match`);

  return null;
};

/**
 * Removes anything except letters and digits from a string
 */
function cleanup(text: string): string {
  return text.replace(/[^\w\d]/g, "");
}

function checkActorMatch(
  performers: SceneResult.Performer[],
  actors: string[] | undefined
): boolean {
  let isActorsMatch: boolean = false;
  if (performers?.length && actors?.length) {
    isActorsMatch = actors.every((actor) =>
      performers.filter(
        ({ name }) => name.localeCompare(actor, undefined, { sensitivity: "base" }) === 0
      )
    );
  }
  return isActorsMatch;
}

function checkStudioMatch(site: SceneResult.Site, studio: string | undefined): boolean {
  let isStudioMatch: boolean = false;
  if (site?.name && studio) {
    isStudioMatch =
      cleanup(site.name).localeCompare(cleanup(studio), undefined, { sensitivity: "base" }) === 0;
  }
  return isStudioMatch;
}

/**
 * Tries to find a scene that matches a combination of piped data.
 *
 * @param ctx - plugin context
 * @param sceneList - list of scenes to try to match
 * @returns the matched scene or null
 */
export const matchSceneResultToPipedData = (
  ctx: MyContext,
  sceneList: SceneResult.SlimSceneData[]
): SceneResult.SlimSceneData | null => {
  const { data, $formatMessage, $moment } = ctx;
  ctx.$logger.verbose(`MATCH PIPED: ${sceneList.length} results found`);

  const sceneMatchingScores: number[] = [];
  for (const scene of sceneList) {
    const foundTitle = stripStr(scene.title || "").trim();
    const searchedTitle = stripStr(data.name ?? data.movie ?? "").trim();

    const isTitleMatch =
      foundTitle.localeCompare(searchedTitle, undefined, { sensitivity: "base" }) === 0;
    const isActorsMatch = checkActorMatch(scene.performers, data.actors);
    const isDateMatch = $moment(scene.date, "YYYY-MM-DD").valueOf() === data.releaseDate;
    const isStudioMatch = checkStudioMatch(scene.site, data.studio);

    let confidenceScore: number = 0.0;
    if (isTitleMatch && isActorsMatch) {
      confidenceScore = 1.0;
    } else if (isTitleMatch) {
      confidenceScore = 0.8;
    } else if (isActorsMatch && isDateMatch && isStudioMatch) {
      confidenceScore = 0.7;
    } else if (isActorsMatch && isDateMatch) {
      confidenceScore = 0.3;
    }
    sceneMatchingScores.push(confidenceScore);

    ctx.$logger.verbose(
      `MATCH PIPED: Trying to match TPD scene:\n${$formatMessage({
        studio: scene.site?.name,
        title: foundTitle,
        actors: scene.performers?.map((performer) => performer.name),
        releaseDate: scene.date,
      })}\nConfidence score for this scene: ${confidenceScore}`
    );
  }

  const indexOfMax = sceneMatchingScores.indexOf(Math.max(...sceneMatchingScores));
  if (sceneMatchingScores[indexOfMax] > 0) {
    ctx.$logger.verbose(
      `MATCH PIPED: SUCCESS: matched with a confidence score of ${sceneMatchingScores[indexOfMax]} to TPDB scene: ${sceneList[indexOfMax].title}`
    );
    return sceneList[indexOfMax];
  }

  ctx.$logger.error(`MATCH PIPED:\tERR: did not find any match`);
  return null;
};

/**
 * @param sceneData - tpdb scene data
 * @returns the data in a plugin scene output form
 */
export const normalizeSceneResultData = (sceneData: SceneResult.SceneData): SceneOutput => {
  const result: SceneOutput = {};

  if (sceneData.title) {
    result.name = sceneData.title;
  }

  if (sceneData.description) {
    result.description = sceneData.description;
  }

  if (sceneData.date) {
    result.releaseDate = new Date(sceneData.date).getTime();
  }

  if (sceneData.tags?.length) {
    result.labels = sceneData.tags.map((l) => l.tag);
  }

  if (sceneData.background.large && !sceneData.background.large.includes("default")) {
    result.thumbnail = sceneData.background.large;
  }

  if (sceneData.performers) {
    result.actors = sceneData.performers.map((p) => p.name);
  }

  if (sceneData.site.name) {
    result.studio = sceneData.site.name;
  }

  return result;
};

/**
 * Checks if the title already exists in the db
 *
 * @param ctx - plugin context
 * @param sceneTitle - title to search
 */
export const checkSceneExistsInDb = (ctx: MyContext, sceneTitle: string | undefined): void => {
  if (!sceneTitle || !ctx.args?.sceneDuplicationCheck || !ctx.args?.source_settings?.scenes) {
    return;
  }

  // Is there a duplicate scene already in the Database with that name?
  let foundDupScene = false;
  // If i decide to do anything with duplicate scenes, this variable on the next line will come into play
  // let TheDupedScene = [];
  const lines = ctx.$fs.readFileSync(ctx.args.source_settings.scenes, "utf8").split("\n");

  let line = lines.shift();
  while (!foundDupScene && line) {
    if (ignoreDbLine(line) || !stripStr(JSON.parse(line).name.toString())) {
      line = lines.shift();
      continue;
    }

    const matchSceneRegexes = [
      escapeRegExp(stripStr(JSON.parse(line).name.toString())),
      escapeRegExp(stripStr(JSON.parse(line).name.toString()).replace(/ /g, "")),
    ].map((str) => new RegExp(str, "gi"));

    if (matchSceneRegexes.some((regex) => regex.test(stripStr(sceneTitle)))) {
      foundDupScene = true;
      // TheDupedScene = stripStr(JSON.parse(line).name.toString());
      break;
    }

    line = lines.shift();
  }

  if (foundDupScene) {
    // Found a possible duplicate

    ctx.$logger.warn("Title Duplication check: Found a possible duplicate title in the database");
    // Exit? Break? Return?
  } else {
    ctx.$logger.verbose("Title Duplication check: Did not find any possible duplicate title");
  }
};
