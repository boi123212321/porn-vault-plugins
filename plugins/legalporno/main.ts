import { applyMetadata, Plugin, Context } from "../../types/plugin";

import $cheerio from "cheerio";

import info from "./info.json";

type MyContext = Context & { sceneName?: string };

function extractShootId(originalTitle: string): string | null {
  const sceneIdMatch = originalTitle.match(
    /(AB|AF|GP|SZ|IV|GIO|RS|TW|MA|FM|SAL|NR|AA|GL|BZ|FS|KS|OTS|NF|NT|AX|RV|CM|BTG|MS|YE|VK|SAA|SF|ALS|QE|SA|BRB|SHN|NRX|MSV|PF)\d+/i
  ); // detect studio prefixes
  const shootId = sceneIdMatch ? sceneIdMatch[0] : null;
  return shootId;
}

async function directSearch(ctx: MyContext, sceneId: string): Promise<string | null> {
  ctx.$logger.verbose(`Getting scene: ${sceneId}`);
  const res = await ctx.$axios.get<string>(`https://www.analvids.com/search`, {
    params: {
      query: sceneId,
    },
  });
  const url = res.request.res.responseUrl as string;
  if (url.includes("/watch")) {
    return url;
  }
  return null;
}

async function autocompleteSearch(ctx: MyContext, sceneId: string): Promise<string | null> {
  ctx.$logger.verbose(`Searching for scenes using query: ${sceneId}`);
  const { terms } = (
    await ctx.$axios.get<{
      terms: { type: "model" | "scene"; url: string; name: string }[];
    }>("https://www.analvids.com/api/autocomplete/search", {
      params: {
        q: sceneId,
      },
    })
  ).data;
  const term = terms.find(({ name }) => name.toLowerCase().includes(sceneId.toLowerCase()));
  return term?.url || null;
}

async function getSceneUrl(ctx: MyContext, sceneId: string): Promise<string | null> {
  const directUrl = await directSearch(ctx, sceneId);
  if (directUrl) {
    return directUrl;
  }
  const searchUrl = await autocompleteSearch(ctx, sceneId);
  return searchUrl;
}

const handler: Plugin<MyContext, any> = async (ctx) => {
  const { $logger, sceneName, event } = ctx;

  const args = ctx.args as Partial<{
    dry: boolean;
    useSceneId: boolean;
    deep: boolean;
  }>;

  if (!sceneName) {
    $logger.warn(`Invalid event: ${event}`);
    return {};
  }

  $logger.verbose(`Extracting shoot ID from scene name: ${sceneName}`);

  const shootId = extractShootId(sceneName);
  if (shootId) {
    const cleanShootId = shootId.trim();
    $logger.info("Extracted scene ID: " + cleanShootId);

    const result: Record<string, unknown> = {
      custom: {
        "Shoot ID": cleanShootId,
        "Scene ID": cleanShootId,
      },
    };

    if (args.useSceneId) {
      result.name = cleanShootId;
      $logger.verbose("Setting name to shoot ID");
    }

    if (args.deep === false) {
      $logger.verbose("Not getting deep info");
    } else {
      const sceneUrl = await getSceneUrl(ctx, cleanShootId);

      if (!sceneUrl) {
        $logger.warn(`Scene not found for shoot ID: ${cleanShootId}`);
      } else {
        $logger.verbose(`Getting more scene info (deep: true): ${sceneUrl}`);

        // Scraping courtesy of traxxx (https://traxxx.me)
        const html = (await ctx.$axios.get<string>(sceneUrl)).data;

        const $ = $cheerio.load(html, { normalizeWhitespace: true });

        if (!args.useSceneId) {
          const originalTitle = $("h1.watchpage-title").text().trim();
          result.name = originalTitle;
        }

        result.releaseDate = ctx.$moment
          .utc($('span[title="Release date"] a').text(), "YYYY-MM-DD")
          .valueOf();

        const [actorsElement, tagsElement, descriptionElement] = $(
          ".scene-description__row"
        ).toArray();

        result.description =
          $('meta[name="description"]')?.attr("content")?.trim() ||
          (descriptionElement && $(descriptionElement).find("dd").text().trim());

        result.actors = $(actorsElement)
          .find('a[href*="com/model"]')
          .map((_, actorElement) => $(actorElement).text())
          .toArray()
          .sort();

        result.labels = $(tagsElement)
          .find("a")
          .map((_, tagElement) => $(tagElement).text())
          .toArray()
          .sort();

        result.studio = $(".watchpage-studioname").first().text().trim();
      }
    }

    if (args.dry) {
      $logger.warn(`Would have returned ${ctx.$formatMessage(result)}`);
      return {};
    }
    return result;
  }

  $logger.info("No scene ID found");

  return {};
};

handler.requiredVersion = ">=0.27.0";

applyMetadata(handler, info);

module.exports = handler;

export default handler;
