'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

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
function getArgs(ctx) {
    return ctx.args;
}
function search(ctx, siteUrl, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${siteUrl}/api/search/__autocomplete`;
        ctx.$logger.debug(`GET ${url}`);
        const res = yield ctx.$axios.get(url, {
            params: {
                q: query,
            },
        });
        return res.data.data.videos;
    });
}
function basicMatch(ctx, a, b) {
    const stripString = getArgs(ctx).stripString || "[^a-zA-Z0-9'/\\,()[\\]{}-]";
    const stripRegex = new RegExp(stripString, "g");
    function normalize(str) {
        return str.trim().toLocaleLowerCase().replace(stripRegex, "");
    }
    return normalize(a).includes(normalize(b));
}
function findSite(ctx, str) {
    return sites.find((site) => {
        ctx.$logger.debug(`Compare "${str}" <-> "${site.name}"`);
        return basicMatch(ctx, str, site.name);
    });
}
var main = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const { $logger, sceneName, scene, event, $formatMessage, $path } = ctx;
    if (!sceneName) {
        $logger.error(`Invalid event: ${event}`);
        return {};
    }
    if (!scene.path) {
        $logger.error(`No scene path: ${scene._id}`);
        return {};
    }
    const result = {
        custom: {},
        $markers: [],
    };
    $logger.verbose(`Checking VIXEN sites for "${scene.path}"`);
    const site = findSite(ctx, scene.path) || findSite(ctx, (yield ctx.$getStudio()).name);
    if (!site) {
        $logger.warn(`No VIXEN site found in "${scene.path}"`);
        return {};
    }
    const basename = $path.basename(scene.path);
    const filename = basename.replace($path.extname(basename), "");
    const searchResults = yield search(ctx, site.url, filename);
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
    }
    else {
        const sceneUrl = `${site.url}/api${found.targetUrl}`;
        $logger.verbose(`Getting more scene info (deep: true): ${sceneUrl}`);
        const { data } = (yield ctx.$axios.get(sceneUrl)).data;
        const scene = data.video;
        result.releaseDate = new Date(scene.releaseDate).valueOf();
        result.custom.director = scene.directorNames;
        result.labels = scene.categories.map(({ name }) => name).sort();
        const thumbUrl = decodeURI(scene.trippleThumbUrlSizes.mainThumb["1040w"]).replace(/&amp;/g, "&");
        result.$thumbnail = thumbUrl;
        if (args.useThumbnail) {
            $logger.verbose("Setting thumbnail");
            result.thumbnail = yield ctx.$createImage(thumbUrl, `${result.name}`, true);
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
        yield ctx.$createMarker(name, time);
    }
    return result;
});

module.exports = main;
