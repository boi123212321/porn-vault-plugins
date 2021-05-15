'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var plugin = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMetadata = void 0;
function applyMetadata(handler, info) {
    handler.info = info;
}
exports.applyMetadata = applyMetadata;
});

var utils = createCommonjsModule(function (module, exports) {
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entries = exports.executeScape = exports.scanFolder = exports.validateArgs = void 0;
const validateArgs = (ctx) => {
    const baseScrapeDefinition = ctx.$zod.object({
        path: ctx.$zod.string().refine((val) => val && val.trim().length, "The path cannot be empty"),
        searchTerms: ctx.$zod.array(ctx.$zod.string()).optional(),
        blacklistTerms: ctx.$zod.array(ctx.$zod.string()).optional(),
        max: ctx.$zod.number().optional(),
        mustMatchInFilename: ctx.$zod.boolean().optional(),
    });
    const ActorConf = baseScrapeDefinition.extend({
        prop: ctx.$zod.enum(["thumbnail", "altThumbnail", "avatar", "hero", "extra"]),
    });
    const SceneConf = baseScrapeDefinition.extend({
        prop: ctx.$zod.enum(["thumbnail", "extra"]),
    });
    const MovieConf = baseScrapeDefinition.extend({
        prop: ctx.$zod.enum(["backCover", "frontCover", "spineCover", "extra"]),
    });
    const StudioConf = baseScrapeDefinition.extend({
        prop: ctx.$zod.enum(["thumbnail", "extra"]),
    });
    const ArgsSchema = ctx.$zod.object({
        dry: ctx.$zod.boolean().optional(),
        actors: ctx.$zod.array(ActorConf).optional(),
        scenes: ctx.$zod.array(SceneConf).optional(),
        movies: ctx.$zod.array(MovieConf).optional(),
        studios: ctx.$zod.array(StudioConf).optional(),
    });
    try {
        ArgsSchema.parse(ctx.args);
    }
    catch (err) {
        return err;
    }
    return true;
};
exports.validateArgs = validateArgs;
const IMAGE_EXTENSIONS = [".jpg", ".png", ".jpeg", ".gif"];
function scanFolder(ctx, query, scrapeDefinition) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryPath = ctx.$path.resolve(scrapeDefinition.path);
        ctx.$logger.info(`Trying to find "${scrapeDefinition.prop}" pictures of "${query}" in "${queryPath}"`);
        if (scrapeDefinition.prop === "extra" && scrapeDefinition.max === 0) {
            ctx.$logger.verbose(`"max" is 0, will not search`);
            return {};
        }
        const foundImagePaths = [];
        yield ctx.$walk({
            dir: queryPath,
            extensions: IMAGE_EXTENSIONS,
            exclude: [],
            cb: (imagePath) => __awaiter(this, void 0, void 0, function* () {
                const itemsToMatch = [query, ...(scrapeDefinition.searchTerms || [])].map((el) => ({
                    _id: `${scrapeDefinition.prop} ${el}`,
                    name: el,
                }));
                const blacklistedItems = (scrapeDefinition.blacklistTerms || []).map((str) => ({
                    _id: str,
                    name: str,
                }));
                const pathToMatch = scrapeDefinition.mustMatchInFilename
                    ? ctx.$path.basename(imagePath)
                    : imagePath;
                const isMatch = ctx.$matcher.filterMatchingItems(itemsToMatch, pathToMatch, (el) => [el.name]).length ===
                    itemsToMatch.length &&
                    !ctx.$matcher.filterMatchingItems(blacklistedItems, pathToMatch, (el) => [el.name]).length;
                if (!isMatch) {
                    return;
                }
                foundImagePaths.push(imagePath);
                if (scrapeDefinition.prop !== "extra" ||
                    (scrapeDefinition.max &&
                        scrapeDefinition.max > 0 &&
                        foundImagePaths.length >= scrapeDefinition.max)) {
                    return true;
                }
            }),
        });
        if (!foundImagePaths.length) {
            ctx.$logger.verbose(`No "${scrapeDefinition.prop}" pictures of "${query}" in "${queryPath}"`);
            return {};
        }
        ctx.$logger.verbose(`Found ${foundImagePaths.length} "${scrapeDefinition.prop}" picture(s) for "${query}": ${JSON.stringify(foundImagePaths)}`);
        return {
            [scrapeDefinition.prop]: scrapeDefinition.prop === "extra" ? foundImagePaths : foundImagePaths[0],
        };
    });
}
exports.scanFolder = scanFolder;
function executeScape(ctx, query, scrapeDefinitions) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = { extra: [] };
        const scrapePromises = scrapeDefinitions.map((definition) => scanFolder(ctx, query, definition)
            .then((scanRes) => {
            const image = scanRes[definition.prop];
            if (definition.prop !== "extra" && image && typeof image === "string") {
                result[definition.prop] = image;
            }
            else if (scanRes.extra) {
                result.extra.push(...scanRes.extra);
            }
        })
            .catch((err) => {
            ctx.$logger.error(ctx.$formatMessage(err));
            ctx.$logger.error(`scrape "${definition.prop}" in "${definition.path}" failed`);
            return {};
        }));
        yield Promise.all(scrapePromises);
        return result;
    });
}
exports.executeScape = executeScape;
exports.entries = Object.entries;
});

var name = "pics";
var version = "2.2.0";
var authors = [
	"boi123212321",
	"john4valor",
	"leadwolf"
];
var description = "Find actor, scene, movie, studio images based on local files. GIF support.";
var events = [
	"actorCreated",
	"actorCustom",
	"sceneCreated",
	"sceneCustom",
	"movieCreated",
	"studioCreated",
	"studioCustom"
];
var require$$0 = {
	name: name,
	version: version,
	authors: authors,
	description: description,
	events: events,
	"arguments": [
	{
		name: "dry",
		type: "Boolean",
		required: false,
		"default": false,
		description: "Whether to commit data changes"
	},
	{
		name: "actors",
		type: "Array",
		required: true,
		"default": [
		],
		description: "Array of picture search configurations for actors"
	},
	{
		name: "actors.[0]",
		type: "Object",
		required: true,
		"default": {
		},
		description: "One configuration for a type of actor picture"
	},
	{
		name: "actors.[0].prop",
		type: "`'thumbnail' \\| 'altThumbnail' \\| 'avatar' \\| 'hero' \\| 'extra'`",
		required: true,
		"default": "thumbnail",
		description: "The type of picture that should be attached to the actor. Set to `'extra'` to add any image you want to the gallery"
	},
	{
		name: "actors.[0].path",
		type: "string",
		required: true,
		"default": "./path/to/all/actor/pictures",
		description: "The path in which to search for this picture"
	},
	{
		name: "actors.[0].searchTerms",
		type: "string[]",
		required: false,
		"default": [
			"thumbnail"
		],
		description: "Extra terms that the picture path should contain"
	},
	{
		name: "actors.[0].blacklistTerms",
		type: "string",
		required: false,
		"default": [
		],
		description: "Terms that should not be found in an image path"
	},
	{
		name: "actors.[0].mustMatchInFilename",
		type: "boolean",
		required: false,
		"default": false,
		description: "If the name of the actor and the `searchTerms` must be matched against the filename, instead of the file path"
	},
	{
		name: "actors.[0].max",
		type: "number",
		required: false,
		"default": -1,
		description: "Only needed for an `'extra'` search configuration: how many max images to get. Do not define or use a negative number to get all. You can otherwise omit this property"
	},
	{
		name: "scenes",
		type: "Array",
		required: true,
		"default": [
		],
		description: "Array of picture search configurations for scenes"
	},
	{
		name: "scenes.[0]",
		type: "Object",
		required: true,
		"default": {
		},
		description: "One configuration for a type of scene picture"
	},
	{
		name: "scenes.[0].prop",
		type: "`'thumbnail' \\| 'extra'`",
		required: true,
		"default": "thumbnail",
		description: "The type of picture that should be attached to the scene. Set to `'extra'` to add any image you want to the gallery"
	},
	{
		name: "scenes.[0].path",
		type: "string",
		required: true,
		"default": "./path/to/all/scene/pictures",
		description: "The path in which to search for this picture"
	},
	{
		name: "scenes.[0].searchTerms",
		type: "string[]",
		required: false,
		"default": [
			"thumbnail"
		],
		description: "Extra terms that the picture path should contain"
	},
	{
		name: "scenes.[0].blacklistTerms",
		type: "string",
		required: false,
		"default": [
		],
		description: "Terms that should not be found in an image path"
	},
	{
		name: "scenes.[0].mustMatchInFilename",
		type: "boolean",
		required: false,
		"default": false,
		description: "If the name of the scene and the `searchTerms` must be matched against the filename, instead of the file path"
	},
	{
		name: "scenes.[0].max",
		type: "number",
		required: false,
		"default": -1,
		description: "Only needed for an `'extra'` search configuration: how many max images to get. Do not define or use a negative number to get all. You can otherwise omit this property"
	},
	{
		name: "movies",
		type: "Array",
		required: true,
		"default": [
		],
		description: "Array of picture search configurations for movies"
	},
	{
		name: "movies.[0]",
		type: "Object",
		required: true,
		"default": {
		},
		description: "One configuration for a type of movie picture"
	},
	{
		name: "movies.[0].prop",
		type: "`'backCover' \\| 'frontCover' \\| 'spineCover' \\| 'extra'`",
		required: true,
		"default": "thumbnail",
		description: "The type of picture that should be attached to the movie. Set to `'extra'` to add any image you want to the gallery"
	},
	{
		name: "movies.[0].path",
		type: "string",
		required: true,
		"default": "./path/to/all/movie/pictures",
		description: "The path in which to search for this picture"
	},
	{
		name: "movies.[0].searchTerms",
		type: "string[]",
		required: false,
		"default": [
			"thumbnail"
		],
		description: "Extra terms that the picture path should contain"
	},
	{
		name: "movies.[0].blacklistTerms",
		type: "string",
		required: false,
		"default": [
		],
		description: "Terms that should not be found in an image path"
	},
	{
		name: "actors.[0].mustMatchInFilename",
		type: "boolean",
		required: false,
		"default": false,
		description: "If the name of the movie and the `searchTerms` must be matched against the filename, instead of the file path"
	},
	{
		name: "movies.[0].max",
		type: "number",
		required: false,
		"default": -1,
		description: "Only needed for an `'extra'` search configuration: how many max images to get. Do not define or use a negative number to get all. You can otherwise omit this property"
	},
	{
		name: "studios",
		type: "Array",
		required: true,
		"default": [
		],
		description: "Array of picture search configurations for studios"
	},
	{
		name: "studios.[0]",
		type: "Object",
		required: true,
		"default": {
		},
		description: "One configuration for a type of studio picture"
	},
	{
		name: "studios.[0].prop",
		type: "`'thumbnail' \\| 'extra'`",
		required: true,
		"default": "thumbnail",
		description: "The type of picture that should be attached to the studio. Set to `'extra'` to add any image you want to the gallery"
	},
	{
		name: "studios.[0].path",
		type: "string",
		required: true,
		"default": "./path/to/all/studio/pictures",
		description: "The path in which to search for this picture"
	},
	{
		name: "studios.[0].searchTerms",
		type: "string[]",
		required: false,
		"default": [
			"thumbnail"
		],
		description: "Extra terms that the picture path should contain"
	},
	{
		name: "studios.[0].blacklistTerms",
		type: "string",
		required: false,
		"default": [
		],
		description: "Terms that should not be found in an image path"
	},
	{
		name: "studios.[0].mustMatchInFilename",
		type: "boolean",
		required: false,
		"default": false,
		description: "If the name of the studio and the `searchTerms` must be matched against the filename, instead of the file path"
	},
	{
		name: "studios.[0].max",
		type: "number",
		required: false,
		"default": -1,
		description: "Only needed for an `'extra'` search configuration: how many max images to get. Do not define or use a negative number to get all. You can otherwise omit this property"
	}
]
};

var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};



const info_json_1 = __importDefault(require$$0);
const eventScrapers = [
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
        events: ["movieCreated", "movieCustom"],
        queryProp: "movieName",
        definitionObj: "movies",
    },
    {
        events: ["studioCreated", "studioCustom"],
        queryProp: "studioName",
        definitionObj: "studios",
    },
];
const handler = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const eventScraperDefinition = eventScrapers.find((scraper) => scraper.events.includes(ctx.event));
    if (!eventScraperDefinition) {
        ctx.$throw(`Uh oh. You shouldn't use the plugin for this type of event "${ctx.event}", cannot run plugin`);
        return {};
    }
    const res = utils.validateArgs(ctx);
    if (res !== true) {
        ctx.$logger.error(`"args" schema is incorrect`);
        ctx.$throw(res);
        return {};
    }
    const query = ctx[eventScraperDefinition.queryProp];
    if (!query) {
        ctx.$throw(`Did not receive name to search for. Expected a string from ${eventScraperDefinition.queryProp}`);
        return {};
    }
    const scrapeDefs = ctx.args[eventScraperDefinition.definitionObj];
    if (!scrapeDefs || !Array.isArray(scrapeDefs) || !scrapeDefs.length) {
        ctx.$throw(`Arguments did not contain object with paths to search for. Expected "args.${eventScraperDefinition.definitionObj}"`);
        return {};
    }
    const scrapeResult = yield utils.executeScape(ctx, query, scrapeDefs);
    if ((_a = ctx.args) === null || _a === void 0 ? void 0 : _a.dry) {
        ctx.$logger.info(`Is 'dry' mode, would've returned: ${ctx.$formatMessage(scrapeResult)}`);
        return {};
    }
    const finalResult = {};
    for (const [prop, image] of utils.entries(scrapeResult)) {
        if (prop !== "extra" && typeof image === "string") {
            finalResult[prop] = yield ctx.$createLocalImage(image, `${query} (${prop})`, true);
        }
        else if (Array.isArray(image)) {
            for (const extraImage of image) {
                yield ctx.$createLocalImage(extraImage, `${query} (extra)`, false);
            }
        }
    }
    return finalResult;
});
handler.requiredVersion = ">=0.27.0";
plugin.applyMetadata(handler, info_json_1.default);
var main = handler;
var _default = handler;
main.default = _default;

module.exports = _default;
