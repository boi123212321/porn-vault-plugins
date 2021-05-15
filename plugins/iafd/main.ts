import { applyMetadata, Plugin, Context } from "../../types/plugin";
import { SceneContext, SceneOutput } from "../../types/scene";

import * as $cheerio from "cheerio";

import info from "./info.json";

interface MySceneContext extends SceneContext {
  args: {
    dry?: boolean;
    whitelist?: string[];
    blacklist?: string[];
    addMovieNameInSceneName?: boolean;
    keepInitialSceneNameForMovies?: boolean;
    sceneIndexMatchingRegex?: string;
  };
}

function lowercase(str: string): string {
  return str.toLowerCase();
}

/**
 * Normalizes a name by removing all the unneeded clutter:
 *  - remove symbols that cause inconsistencies in scene / movies naming conventions
 *  - Remove multiple contiguous spaces
 * @param name
 */
function normalize(name: string): string {
  return name.replace(/(.*)([#V]|Vol|Volume)\W*(\d+)/gi, "$1$3").replace(/\s{2,}/gm, " ");
}

/**
 * Main IAFD search.
 * Everything is called a "movie" on iafd, but it will also search scenes...
 *
 * @returns the found movie url or false
 */
async function searchForMovie(ctx: Context, name: string): Promise<string | false> {
  const { $axios } = ctx;
  const url = `https://www.iafd.com/results.asp?searchtype=comprehensive&searchstring=${name}`;
  const html = (await $axios.get<string>(url)).data;
  const $ = $cheerio.load(html);

  const firstResult = $(".pop-execute").toArray()[0];
  const href = $(firstResult).attr("href");

  if (!href) {
    return false;
  }
  return `https://www.iafd.com${href}`;
}

/**
 * Tries to match the most relevant scene according to the plugin's initial or piped data
 * (when IAFD returned a set of scenes like for movies).
 *
 * The matching is based on (either):
 *  - the presence of an index in the scene's name (like "Scene 1", "S01",...)
 *  - a match of one or more actors
 *
 * @param ctx
 * @param searchSceneName scene name where index will be looked for
 * @param searchActors known scene actors (typically from initial data or piped from the previous plugin)
 * @param scenesActors array of scenes and their actors as scraped from IAFD (one string per scene, with actors comma separated)
 * @returns The index of the best match (or -1 of no "good enough" match could be found).
 */
function searchForScene(
  ctx: MySceneContext,
  searchSceneName: string,
  searchActors: string[],
  scenesActors: string[]
): number {
  const { $logger } = ctx;

  // If there is only one scene in the iafd results, it is always considered a match.
  if (scenesActors.length === 1) {
    return 0;
  }

  const indexFromName: number = matchSceneFromName(ctx, searchSceneName);
  $logger.debug(`Based on scene name matching, the scene index is: ${indexFromName}`);

  // Finds the index of the best matching scene based on actor matching (largest intersection between pv & iafd actors wins)
  const indexFromActors: number = matchSceneFromActors(searchActors, scenesActors);
  $logger.debug(`Based on best actors matching, the scene index is: ${indexFromActors}`);

  // Scene index matched on name/number takes precedence on actor match
  return indexFromName > -1 ? indexFromName : indexFromActors;
}

/**
 * Tries to identify the scene index based on a number pattern in the scene's name.
 *
 * @param name the name to use for the match (assumed to be cleaned-up). It will not match if there are multiple numbers in the name (too ambiguous)
 * @returns the matched index (or -1 if no matches were possible)
 */
function matchSceneFromName(ctx: MySceneContext, name: string): number {
  let indexFromName: number = -1;

  // The name must contain exactly one number between 0-99 for it to be considered a match.
  const nameMatch = Array.from(
    name.matchAll(
      new RegExp(
        ctx.args.sceneIndexMatchingRegex || "(.*)(Scene|S)\\W*(?<index>\\d{1,2})(.*)",
        "gim"
      )
    )
  );
  if (nameMatch.length === 1) {
    indexFromName = Number(nameMatch[0].groups?.index);
    indexFromName = isNaN(indexFromName) ? -1 : indexFromName - 1;
  }

  return indexFromName;
}

/**
 * Tries to identify the scene index based on actors matching (largest intersection between pv & iafd actors wins)
 *
 * @param searchActors
 * @param scenesActors
 * @returns the matched index, -1 if no matches were found or -2 if more than one match was found (ambiguous)
 */
function matchSceneFromActors(searchActors: string[], scenesActors: string[]): number {
  // Actors from the initial scene's or piped data are required for the actor match
  if (!searchActors || !searchActors.length) {
    return -1;
  }

  let indexFromActors: number = -1;
  let matchCount: number = 0;

  scenesActors.forEach(function (item, i) {
    const sceneActors = item.split(", ");

    const isActorsMatch: boolean = searchActors.every(
      (searchActor) =>
        sceneActors.filter(
          (sceneActor) =>
            searchActor.localeCompare(sceneActor, undefined, { sensitivity: "base" }) === 0
        ).length > 0
    );

    if (isActorsMatch) {
      matchCount++;
      indexFromActors = i;
    }
  });

  // Fails if more than one match (ambiguous)
  if (matchCount > 1) {
    return -2;
  }

  return indexFromActors;
}

const handler: Plugin<MySceneContext, SceneOutput> = async (ctx) => {
  const { args, data, $axios, $formatMessage, $moment, sceneName, $logger, $throw } = ctx;

  if (!["sceneCreated", "sceneCustom"].includes(ctx.event)) {
    $throw("Uh oh. You shouldn't use the plugin for this type of event");
  }

  args.keepInitialSceneNameForMovies ??= true;

  const blacklist = (args.blacklist || []).map(lowercase);
  if (!args.blacklist) {
    $logger.verbose("No blacklist defined, returning everything...");
  }
  if (blacklist.length) {
    $logger.verbose(`Blacklist defined, will ignore: ${blacklist.join(", ")}`);
  }

  const whitelist = (args.whitelist || []).map(lowercase);
  if (whitelist.length) {
    $logger.verbose(`Whitelist defined, will only return: ${whitelist.join(", ")}...`);
  }

  function isBlacklisted(prop): boolean {
    if (whitelist.length) {
      return !whitelist.includes(lowercase(prop));
    }
    return blacklist.includes(lowercase(prop));
  }

  function getMovieInternal(): string {
    const scrapedMovie = $(".col-sm-12 h1")
      .text()
      .replace(/\(\d{4}\)/g, "")
      .trim();

    return scrapedMovie;
  }

  function getMovie(): Partial<{ movie: string }> {
    if (isBlacklisted("movie")) {
      return {};
    }

    if (scenesActors.length > 1) {
      return { movie: getMovieInternal() };
    }

    return {};
  }

  function getName(): Partial<{ name: string }> {
    const movie = getMovieInternal();

    // For single-scene titles, return the whole IAFD "movie" name as scene name
    if (scenesActors.length === 1) {
      return { name: movie };
    }

    // For multi-scene titles, return the name from IAFD's scene breakdown
    let scrapedName = $(scenesBreakdown[sceneIndex])
      .text()
      .replace(/\. (.*)$/, "")
      .trim();

    scrapedName = args.keepInitialSceneNameForMovies ? data.name || sceneName : scrapedName;
    if (args.addMovieNameInSceneName && movie.length) {
      scrapedName = `${movie} - ${scrapedName}`;
    }

    return { name: scrapedName };
  }

  function getDescription(): Partial<{ description: string }> {
    // Skips the description if there is more than one scene as it would describe the movie, and not the current scene...
    if (isBlacklisted("description") || scenesActors.length > 1) {
      return {};
    }

    const scrapedDesc = $("#synopsis.panel.panel-default > .padded-panel").text().trim();

    return { description: scrapedDesc };
  }

  function getActors(): Partial<{ actors: string[] }> {
    if (isBlacklisted("actors")) {
      return {};
    }

    const foundActors: string[] = scenesActors[sceneIndex].split(", ");

    if (foundActors.length) {
      return { actors: foundActors };
    }
    return {};
  }

  function getStudio(): Partial<{ studio: string }> {
    if (isBlacklisted("studio")) {
      return {};
    }

    const foundStudio = $("p.biodata > a[href*='/studio.rme']").text().trim();
    $logger.debug(`Found studio: '${foundStudio}'`);

    return { studio: foundStudio };
  }

  function getReleaseDate(): Partial<{ releaseDate: number }> {
    if (isBlacklisted("releaseDate")) {
      return {};
    }

    let date: number | undefined;
    const scrapedReleaseDate = $("p.bioheading:contains('Release Date')").next().text().trim();
    if (scrapedReleaseDate !== "No Data") {
      date = $moment(scrapedReleaseDate, "MMM DD, YYYY").valueOf();
    } else {
      // If release date is absent, look at the title for the release year
      const scrapedReleaseYear = $(".col-sm-12 h1")
        .text()
        .replace(/^(.*)\(((?:19|20)\d\d)\)$/g, "$2")
        .trim();
      date = $moment(scrapedReleaseYear, "YYYY").valueOf();
    }
    $logger.debug(`Found release date: '${date || ""}'`);

    return { releaseDate: date };
  }

  function getLabels(): Partial<{ labels: string[] }> {
    if (isBlacklisted("labels")) {
      return {};
    }

    const foundLabels: string[] = [];
    const actors: string[] = getActors()?.actors || [];
    actors.forEach(function (actor) {
      const actorLabels: string[] = $(`.castbox:contains('${actor}') > p`)
        .children()
        .remove()
        .end()
        .text()
        .trim()
        .split(" ");
      foundLabels.push(...actorLabels.filter((l) => l.length > 0 && foundLabels.indexOf(l) < 0));
    });

    return { labels: foundLabels };
  }

  // Use initial or piped data for the matching
  const searchSceneName: string = data.name || sceneName;
  const searchActors: string[] = data.actors || (await ctx.$getActors())?.map((a) => a.name);
  const searchMovie: string | undefined = data.movie || (await ctx.$getMovies())?.[0]?.name;
  const searchName = searchMovie || searchSceneName;
  $logger.info(`Scraping iafd based on name: '${searchName}'`);

  let url: string | false = false;
  url = await searchForMovie(ctx, normalize(searchName));

  if (!url) {
    $logger.warn("Search aborted: unable to fins any results from iafd.");
    return {};
  }
  const html = (await $axios.get<string>(url)).data;
  const $ = $cheerio.load(html);

  const scenesDiv = $("#sceneinfo.panel.panel-default");
  const scenesBreakdown = $("li.w, li.g", scenesDiv).toArray();
  const scenesActors = scenesBreakdown.map((s) =>
    $(s)
      .children()
      .remove()
      .end()
      .text()
      .replace(/^Scene \d+\. /, "")
      .trim()
  );

  if (scenesActors.length > 1 && !searchMovie) {
    $logger.warn(
      `Aborting search. IAFD returned a multi-scene result, but no movie is present in porn-vault for '${sceneName}'. ` +
        `Look into the plugin documentation how to match multi-scene results.`
    );
    return {};
  }

  const sceneIndex = searchForScene(ctx, searchSceneName, searchActors, scenesActors);
  $logger.verbose(
    `identified scene index ${sceneIndex} out of ${scenesActors.length} scenes returned for '${searchName}'`
  );

  if (sceneIndex < 0) {
    $logger.warn(`Unable to match a scene. Returning with empty results.`);
    return {};
  }

  let result: SceneOutput;
  if (sceneIndex >= scenesActors.length) {
    // IAFD does not reference all movie extras (like BTS, interviews,...).
    // For those, it is only possible to return the general movie attributes (no actors or labels)
    result = {
      ...getMovie(),
      ...getName(),
      ...getStudio(),
      ...getReleaseDate(),
    };
  } else {
    result = {
      ...getMovie(),
      ...getName(),
      ...getDescription(),
      ...getActors(),
      ...getStudio(),
      ...getReleaseDate(),
      ...getLabels(),
    };
  }

  $logger.info(`Found scene name: '${result.name}', starring: '${result.actors?.join(", ")}'`);

  if (args.dry === true) {
    $logger.info(`dry mode. Would have returned: ${$formatMessage(result)}`);
    return {};
  }

  return result;
};

handler.requiredVersion = ">=0.27.0";

applyMetadata(handler, info);

module.exports = handler;

export default handler;
