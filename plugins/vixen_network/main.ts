import { SceneContext } from "../../types/scene";

interface ISceneInfo {
  newId: string;
  releaseDate: string;
  directorNames: string;
  categories: { name: string }[];
  trippleThumbUrlSizes: { mainThumb: { "1040w": string } };
  chapters: {
    video: {
      title: string;
      seconds: number;
    }[];
  };
}

const sites = [
  {
    name: "BLACKED RAW",
    url: "https://blackedraw.com",
  },
  {
    name: "BLACKED",
    url: "https://blacked.com",
  },
  {
    name: "TUSHY RAW",
    url: "https://tushyraw.com",
  },
  {
    name: "TUSHY",
    url: "https://tushy.com",
  },
  {
    name: "VIXEN",
    url: "https://vixen.com",
  },
  {
    name: "DEEPER",
    url: "https://deeper.com",
  },
];

function getArgs(ctx: SceneContext) {
  return ctx.args as Record<string, unknown>;
}

async function search(ctx: SceneContext, siteUrl: string, query: string) {
  const url = `${siteUrl}/api/search/__autocomplete`;
  ctx.$logger.debug(`GET ${url}`);
  const res = await ctx.$axios.get(url, {
    params: {
      q: query,
    },
  });
  return res.data.data.videos as {
    title: string;
    description: string;
    modelsSlugged: { name: string; slugged: string }[];
    targetUrl: string;
  }[];
}

function basicMatch(ctx: SceneContext, a: string, b: string) {
  const stripString = <string>getArgs(ctx).stripString || "[^a-zA-Z0-9'/\\,()[\\]{}-]";
  const stripRegex = new RegExp(stripString, "g");

  function normalize(str: string) {
    return str.trim().toLocaleLowerCase().replace(stripRegex, "");
  }

  return normalize(a).includes(normalize(b));
}

function findSite(ctx: SceneContext, str: string) {
  return sites.find((site) => {
    ctx.$logger.debug(`Compare "${str}" <-> "${site.name}"`);
    return basicMatch(ctx, str, site.name);
  });
}

module.exports = async (ctx: SceneContext): Promise<any> => {
  const { $logger, sceneName, scene, event, $formatMessage, $path } = ctx;

  if (!sceneName) {
    $logger.error(`Invalid event: ${event}`);
    return {};
  }

  if (!scene.path) {
    $logger.error(`No scene path: ${scene._id}`);
    return {};
  }

  const result: {
    custom: Record<string, unknown>;
    $markers: { name: string; time: number }[];
    [key: string]: unknown;
  } = {
    custom: {},
    $markers: [],
  };
  $logger.verbose(`Checking VIXEN sites for "${scene.path}"`);

  const site = findSite(ctx, scene.path) || findSite(ctx, (await ctx.$getStudio()).name);

  if (!site) {
    $logger.warn(`No VIXEN site found in "${scene.path}"`);
    return {};
  }

  const basename = $path.basename(scene.path);
  const filename = basename.replace($path.extname(basename), "");

  const searchResults = await search(ctx, site.url, filename);

  const found = searchResults.find(({ title }) => basicMatch(ctx, filename, title));

  if (!found) {
    $logger.warn(`No result found for "${site.url}"`);
    return {};
  }

  result.name = found.title;
  result.actors = found.modelsSlugged.map(({ name }) => name).sort();
  result.description = found.description;
  result.studio = site.name;

  const args = getArgs(ctx);

  if (args.deep === false) {
    $logger.verbose("Not getting deep info");
  } else {
    const sceneUrl = `${site.url}/api${found.targetUrl}`;
    $logger.verbose(`Getting more scene info (deep: true): ${sceneUrl}`);

    const { data } = (
      await ctx.$axios.get<{
        data: {
          video: ISceneInfo;
        };
      }>(sceneUrl)
    ).data;

    const scene = data.video;

    result.releaseDate = new Date(scene.releaseDate).valueOf();
    result.custom.director = scene.directorNames;
    result.labels = scene.categories.map(({ name }) => name).sort();

    const thumbUrl = decodeURI(scene.trippleThumbUrlSizes.mainThumb["1040w"]).replace(
      /&amp;/g,
      "&"
    );
    result.$thumbnail = thumbUrl;

    if (args.useThumbnail) {
      $logger.verbose("Setting thumbnail");
      result.thumbnail = await ctx.$createImage(thumbUrl, `${result.name}`, true);
    }

    if (args.useChapters) {
      const chapters = scene.chapters.video;
      for (const { title, seconds } of chapters) {
        result.$markers.push({
          name: title,
          time: seconds,
        });
      }
    }
  }

  if (args.dry) {
    $logger.info(`Would have returned ${$formatMessage(result)}`);
    return {};
  }

  $logger.verbose(`Creating ${result.$markers.length} markers`);
  for (const { name, time } of result.$markers) {
    $logger.silly(`Creating marker: ${name} at ${time}s`);
    await ctx.$createMarker(name, time);
  }

  return result;
};
