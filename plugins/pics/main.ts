import { applyMetadata, Plugin } from "../../types/plugin";
import { ActorOutput } from "../../types/actor";
import { MovieOutput } from "../../types/movie";

import { ScrapeDefinition, MyContext } from "./types";
import { entries, executeScape, validateArgs } from "./utils";

import info from "./info.json";

interface ScrapeEventDefinition {
  events: string[];
  queryProp: string;
  definitionObj: string;
}

const eventScrapers: ScrapeEventDefinition[] = [
  {
    events: ["actorCreated", "actorCustom"],
    queryProp: "actorName",
    definitionObj: "actors",
  },
  {
    events: ["sceneCreated", "sceneCustom"],
    queryProp: "sceneName",
    definitionObj: "scenes",
  },
  {
    events: ["movieCreated", "movieCustom"], // Anticipate custom movie event
    queryProp: "movieName",
    definitionObj: "movies",
  },
  {
    events: ["studioCreated", "studioCustom"],
    queryProp: "studioName",
    definitionObj: "studios",
  },
];

const handler: Plugin<MyContext, ActorOutput | MovieOutput | undefined> = async (ctx) => {
  const eventScraperDefinition = eventScrapers.find((scraper) =>
    scraper.events.includes(ctx.event)
  );
  if (!eventScraperDefinition) {
    ctx.$throw(
      `Uh oh. You shouldn't use the plugin for this type of event "${ctx.event}", cannot run plugin`
    );
    return {};
  }

  const res = validateArgs(ctx);
  if (res !== true) {
    ctx.$logger.error(`"args" schema is incorrect`);
    ctx.$throw(res);
    return {};
  }

  const query = ctx[eventScraperDefinition.queryProp] as string | undefined;
  if (!query) {
    ctx.$throw(
      `Did not receive name to search for. Expected a string from ${eventScraperDefinition.queryProp}`
    );
    return {};
  }

  const scrapeDefs = ctx.args[eventScraperDefinition.definitionObj] as
    | ScrapeDefinition[]
    | undefined;
  if (!scrapeDefs || !Array.isArray(scrapeDefs) || !scrapeDefs.length) {
    ctx.$throw(
      `Arguments did not contain object with paths to search for. Expected "args.${eventScraperDefinition.definitionObj}"`
    );
    return {}; // return for type compatibility
  }

  const scrapeResult = await executeScape(ctx, query, scrapeDefs);

  if (ctx.args?.dry) {
    ctx.$logger.info(`Is 'dry' mode, would've returned: ${ctx.$formatMessage(scrapeResult)}`);
    return {};
  }

  const finalResult: Partial<
    {
      [key in Exclude<ScrapeDefinition["prop"], "extra">]: string;
    }
  > = {};
  for (const [prop, image] of entries(scrapeResult)) {
    if (prop !== "extra" && typeof image === "string") {
      finalResult[prop] = await ctx.$createLocalImage(image, `${query} (${prop})`, true);
    } else if (Array.isArray(image)) {
      for (const extraImage of image) {
        await ctx.$createLocalImage(extraImage, `${query} (extra)`, false);
      }
    }
  }

  return finalResult;
};

handler.requiredVersion = ">=0.27.0";

applyMetadata(handler, info);

module.exports = handler;

export default handler;
