'use strict';

var fs_1 = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs_1__default = /*#__PURE__*/_interopDefaultLegacy(fs_1);

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

var template = createCommonjsModule(function (module, exports) {
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
exports.getTemplateFieldValue = exports.getAndValidateFieldArgs = exports.getTemplateFieldsResolvers = exports.getTemplateMatcher = void 0;
const FIELD_NAME = "name";
const FIELD_RELEASE_DATE = "releaseDate";
const FIELD_RATING = "rating";
const FIELD_VIDEO_HEIGHT = "videoHeight";
const FIELD_VIDEO_WIDTH = "videoWidth";
const FIELD_VIDEO_DURATION = "videoDuration";
const FIELD_ACTORS = "actors";
const FIELD_STUDIO = "studio";
const FIELD_MOVIES = "movies";
const FIELD_LABELS = "labels";
const safeInitialDataForSceneCreate = ["videoDuration", "videoWidth", "videoHeight"];
function getTemplateMatcher() {
    return /{(?<prefix>[^{}<]*)<(?<field>[^\d\s\W(>]*)(?<args>[\d\W]*|(?:\([^){}]*\))*)>(?<suffix>[^{}]*)}/g;
}
exports.getTemplateMatcher = getTemplateMatcher;
function getTemplateFieldsResolvers(ctx) {
    const { args, scene, data, $moment } = ctx;
    const HAS_NAME_PROP = true;
    const NO_NAME_PROP = false;
    return [
        {
            name: FIELD_NAME,
            getPluginData: (i) => __awaiter(this, void 0, void 0, function* () { return data.name; }),
            getInitialData: (i) => __awaiter(this, void 0, void 0, function* () { return scene.name; }),
        },
        {
            name: FIELD_RELEASE_DATE,
            getPluginData: (i) => __awaiter(this, void 0, void 0, function* () { return data.releaseDate ? $moment(data.releaseDate).format(args.dateFormat) : undefined; }),
            getInitialData: (i) => __awaiter(this, void 0, void 0, function* () { return scene.releaseDate ? $moment(scene.releaseDate).format(args.dateFormat) : undefined; }),
        },
        {
            name: FIELD_RATING,
            getPluginData: (i) => __awaiter(this, void 0, void 0, function* () { var _a; return (_a = data.rating) === null || _a === void 0 ? void 0 : _a.toString(); }),
            getInitialData: (i) => __awaiter(this, void 0, void 0, function* () { var _b; return (_b = scene.rating) === null || _b === void 0 ? void 0 : _b.toString(); }),
        },
        {
            name: FIELD_VIDEO_HEIGHT,
            getInitialData: (i) => __awaiter(this, void 0, void 0, function* () { var _c, _d, _e; return (_e = (_d = (_c = scene.meta) === null || _c === void 0 ? void 0 : _c.dimensions) === null || _d === void 0 ? void 0 : _d.height) === null || _e === void 0 ? void 0 : _e.toString(); }),
        },
        {
            name: FIELD_VIDEO_WIDTH,
            getInitialData: (i) => __awaiter(this, void 0, void 0, function* () { var _f, _g, _h; return (_h = (_g = (_f = scene.meta) === null || _f === void 0 ? void 0 : _f.dimensions) === null || _g === void 0 ? void 0 : _g.width) === null || _h === void 0 ? void 0 : _h.toString(); }),
        },
        {
            name: FIELD_VIDEO_DURATION,
            getInitialData: (i) => __awaiter(this, void 0, void 0, function* () { var _j; return formatVideoDuration($moment, (_j = scene.meta) === null || _j === void 0 ? void 0 : _j.duration); }),
        },
        {
            name: FIELD_ACTORS,
            getPluginData: (i) => __awaiter(this, void 0, void 0, function* () {
                const actors = data.actors;
                return arrayToString(ctx, actors, i, NO_NAME_PROP);
            }),
            getInitialData: (i) => __awaiter(this, void 0, void 0, function* () {
                const actors = yield ctx.$getActors();
                return arrayToString(ctx, actors, i, HAS_NAME_PROP);
            }),
        },
        {
            name: FIELD_STUDIO,
            getPluginData: (i) => __awaiter(this, void 0, void 0, function* () { return data.studio; }),
            getInitialData: (i) => __awaiter(this, void 0, void 0, function* () {
                var _k;
                return (_k = (yield ctx.$getStudio())) === null || _k === void 0 ? void 0 : _k.name;
            }),
        },
        {
            name: FIELD_LABELS,
            getPluginData: (i) => __awaiter(this, void 0, void 0, function* () {
                const labels = data.labels;
                return arrayToString(ctx, labels, i, NO_NAME_PROP);
            }),
            getInitialData: (i) => __awaiter(this, void 0, void 0, function* () {
                const labels = yield ctx.$getLabels();
                return arrayToString(ctx, labels, i, HAS_NAME_PROP);
            }),
        },
        {
            name: FIELD_MOVIES,
            getPluginData: (i) => __awaiter(this, void 0, void 0, function* () { return data.movie; }),
            getInitialData: (i) => __awaiter(this, void 0, void 0, function* () {
                const movies = yield ctx.$getMovies();
                return arrayToString(ctx, movies, i, HAS_NAME_PROP);
            }),
        },
    ];
}
exports.getTemplateFieldsResolvers = getTemplateFieldsResolvers;
function getAndValidateFieldArgs(args) {
    var _a, _b, _c;
    if (!args) {
        return { isValid: true, isMandatory: false };
    }
    let isValid = false;
    let isMandatory = false;
    let index;
    const matches = args.matchAll(/^(?<index>\d{0,2})(?<mandatory>!?)$/gm);
    for (const match of matches) {
        if ((_a = match.groups) === null || _a === void 0 ? void 0 : _a.index)
            index = parseInt((_b = match.groups) === null || _b === void 0 ? void 0 : _b.index) - 1;
        if ((_c = match.groups) === null || _c === void 0 ? void 0 : _c.mandatory)
            isMandatory = true;
        isValid = true;
    }
    return { isValid, isMandatory, index };
}
exports.getAndValidateFieldArgs = getAndValidateFieldArgs;
function getTemplateFieldValue(ctx, resolver, index) {
    return __awaiter(this, void 0, void 0, function* () {
        let fieldValue;
        if (resolver.getPluginData) {
            fieldValue = yield resolver.getPluginData(index);
        }
        if (ctx.event === "sceneCustom" ||
            (ctx.event === "sceneCreated" && safeInitialDataForSceneCreate.includes(resolver.name))) {
            fieldValue !== null && fieldValue !== void 0 ? fieldValue : (fieldValue = yield resolver.getInitialData(index));
        }
        return fieldValue;
    });
}
exports.getTemplateFieldValue = getTemplateFieldValue;
function arrayToString(ctx, array, index, hasNameProperty) {
    if (!array || !array.length) {
        return;
    }
    const i = index || -1;
    const a = hasNameProperty ? array.map((a) => a.name) : array;
    if (i < 0) {
        return a.join(ctx.args.multiValuesSeparator);
    }
    if (i >= a.length) {
        ctx.$logger.verbose(`The field <${(typeof a).toLowerCase()}${i + 1}> from template is out of bounds (total items: ${a.length})`);
        return;
    }
    return a[i];
}
function formatVideoDuration($moment, duration) {
    if (duration) {
        return $moment()
            .startOf("day")
            .seconds(duration)
            .format(duration < 3600 ? "mm∶ss" : "H∶mm∶ss");
    }
}
});

var utils = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = exports.toNormalizedSafeFilename = void 0;
function toNormalizedSafeFilename(ctx, unsafeName) {
    let safeFileName = sanitize(unsafeName, ctx.args.characterReplacement);
    if (ctx.args.normalizeAccents) {
        safeFileName = safeFileName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    if (ctx.args.normalizeMultipleSpaces) {
        safeFileName = safeFileName.replace(/ {2,}/g, " ");
    }
    return safeFileName.trim();
}
exports.toNormalizedSafeFilename = toNormalizedSafeFilename;
function sanitize(input, replacement) {
    const illegalRe = /[/?<>\\:*|"]/g;
    const controlRe = /[\x00-\x1f\x80-\x9f]/g;
    const reservedRe = /^\.+$/;
    const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    const windowsTrailingRe = /[. ]+$/;
    if (typeof input !== "string") {
        throw new Error("Input must be string");
    }
    let sanitized = input;
    if (replacement) {
        replacement.forEach((e) => {
            sanitized = sanitized.replace(e.original, e.replacement);
        });
    }
    sanitized = sanitized
        .replace(illegalRe, "")
        .replace(controlRe, "")
        .replace(reservedRe, "")
        .replace(windowsReservedRe, "")
        .replace(windowsTrailingRe, "");
    return sanitized;
}
exports.sanitize = sanitize;
});

var name = "fileorganizer";
var version = "0.2.0";
var authors = [
	"arcadianCdr"
];
var description = "Use your custom-defined templates to rename your scene files.";
var events = [
	"sceneCreated",
	"sceneCustom"
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
		description: "Whether to perform the rename operation or just a simulation."
	},
	{
		name: "fileStructureTemplate",
		type: "String",
		required: true,
		"default": "",
		description: "The template for the new name. See documentation above for details."
	},
	{
		name: "normalizeAccents",
		type: "Boolean",
		required: false,
		"default": false,
		description: "Whether to normalize file names and path to unaccented unicode."
	},
	{
		name: "normalizeMultipleSpaces",
		type: "Boolean",
		required: false,
		"default": true,
		description: "Whether to replace multiple spaces with a single space."
	},
	{
		name: "nameConflictHandling",
		type: "String",
		required: false,
		"default": "rename",
		description: "Behavior in case of name conflicts. Possible values are: `rename` and `skip`. With `rename`, the new filename is suffixed with a number so that it does not conflict with an existing name anymore. With `skip`, the rename operation is cancelled."
	},
	{
		name: "dateFormat",
		type: "String",
		required: false,
		"default": "YYYY-MM-DD",
		description: "The date format to use in file names. The full details are available at https://momentjs.com/docs/#/displaying/format/ although you probably just need `YYYY`, `MM` and `DD`."
	},
	{
		name: "multiValuesSeparator",
		type: "String",
		required: true,
		"default": ", ",
		description: "The separator to use for multiple values (like actors, labels,...). For instance, with a `', '` as separator, a list of 3 labels will look like: `label1, label2, label3`."
	},
	{
		name: "characterReplacement",
		type: "object[]",
		required: false,
		"default": [
			{
				original: ":",
				replacement: "∶"
			}
		],
		description: "Used to substitute characters with a replacement alternative. See doc above for details. Note: the examples below looks like it is replacing a colon by a colon, but it is actually replacing the colon (illegal in filenames) by the similar looking 'mathematical ratio' character (allowed in filenames)"
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
function filenameMaker(ctx, template$1) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const { $logger } = ctx;
        let result = "";
        const fieldResolvers = template.getTemplateFieldsResolvers(ctx);
        const matches = template$1.matchAll(template.getTemplateMatcher());
        for (const match of matches) {
            const resolver = fieldResolvers.find((item) => { var _a, _b; return item.name.toLowerCase() === ((_b = (_a = match.groups) === null || _a === void 0 ? void 0 : _a.field) === null || _b === void 0 ? void 0 : _b.toLowerCase()); });
            const fieldArgs = template.getAndValidateFieldArgs((_a = match.groups) === null || _a === void 0 ? void 0 : _a.args);
            if (!resolver || !fieldArgs.isValid) {
                $logger.error(`Unsupported field ${(_b = match.groups) === null || _b === void 0 ? void 0 : _b.field} (or its arguments) in template ${template$1}`);
                return;
            }
            const fieldValue = yield template.getTemplateFieldValue(ctx, resolver, fieldArgs.index);
            if (fieldArgs.isMandatory && !fieldValue) {
                $logger.info(`Skipping rename (the mandatory field ${resolver.name} has no value)`);
                return;
            }
            if (fieldValue) {
                const groupOutput = `${(_c = match.groups) === null || _c === void 0 ? void 0 : _c.prefix}${fieldValue}${(_d = match.groups) === null || _d === void 0 ? void 0 : _d.suffix}`;
                result += groupOutput;
                $logger.debug(`Group output for field <${resolver.name}>: '${groupOutput}'`);
            }
            else {
                $logger.debug(`Got no value for field <${resolver.name}>: the whole group is skipped.`);
            }
        }
        if (result) {
            return utils.toNormalizedSafeFilename(ctx, result);
        }
        else {
            $logger.warn(`Could not generate a new filename based on template: '${template$1}'. All the template fields were without value.`);
        }
    });
}
var ConflictAction;
(function (ConflictAction) {
    ConflictAction["RENAME"] = "rename";
    ConflictAction["SKIP"] = "skip";
})(ConflictAction || (ConflictAction = {}));
const handler = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const { args, scenePath, $formatMessage, $fs, $logger, $path, $throw } = ctx;
    if (!["sceneCreated", "sceneCustom"].includes(ctx.event)) {
        $throw("Uh oh. You shouldn't use the plugin for this type of event");
    }
    $logger.verbose(`Starting fileorganizer for scene: '${scenePath}'`);
    if (!args.fileStructureTemplate || !template.getTemplateMatcher().test(args.fileStructureTemplate)) {
        $throw(`invalid teamplate: '${args.fileStructureTemplate}'. Please correct and retry.`);
    }
    (_a = args.dateFormat) !== null && _a !== void 0 ? _a : (args.dateFormat = args.dateFormat = "YYYY-MM-DD");
    (_b = args.characterReplacement) !== null && _b !== void 0 ? _b : (args.characterReplacement = [{ original: ":", replacement: "∶" }]);
    (_c = args.multiValuesSeparator) !== null && _c !== void 0 ? _c : (args.multiValuesSeparator = ", ");
    (_d = args.nameConflictHandling) !== null && _d !== void 0 ? _d : (args.nameConflictHandling = ConflictAction.RENAME);
    (_e = args.normalizeAccents) !== null && _e !== void 0 ? _e : (args.normalizeAccents = false);
    (_f = args.normalizeMultipleSpaces) !== null && _f !== void 0 ? _f : (args.normalizeMultipleSpaces = true);
    if (!Object.values(ConflictAction).includes(args.nameConflictHandling)) {
        $throw(`Unsupported 'nameConflictHandling' argument value: ${args.nameConflictHandling}. Please adapt your config and retry.`);
    }
    const newFileName = yield filenameMaker(ctx, args.fileStructureTemplate);
    if (!newFileName) {
        return {};
    }
    if (newFileName.length > 255) {
        $logger.warn(`Skipping rename (the new filename is greater than 255 characters): "${newFileName}"`);
        return {};
    }
    const parsed = $path.parse(scenePath);
    let newScenePath = $path.format({ dir: parsed.dir, name: newFileName, ext: parsed.ext });
    if (newScenePath === scenePath) {
        $logger.verbose(`Skipping rename (the filename already match the desired template): "${scenePath}"`);
        return {};
    }
    if (args.dry) {
        $logger.info(`Dry mode. Would have renamed "${scenePath}" to "${newScenePath}"`);
        return {};
    }
    if ($fs.existsSync(newScenePath)) {
        if (args.nameConflictHandling === ConflictAction.SKIP) {
            return {};
        }
        let counter = 1;
        while (args.nameConflictHandling === ConflictAction.RENAME && $fs.existsSync(newScenePath)) {
            newScenePath = $path.format({
                dir: parsed.dir,
                name: `${newFileName}(${counter++})`,
                ext: parsed.ext,
            });
        }
    }
    try {
        yield fs_1__default['default'].promises.rename(scenePath, newScenePath);
    }
    catch (err) {
        $logger.error(`Could not rename "${scenePath}" to "${newScenePath}": ${$formatMessage(err)}`);
        return {};
    }
    $logger.info(`Renamed "${scenePath}" to "${newScenePath}"`);
    return { path: newScenePath };
});
handler.requiredVersion = ">=0.27.0";
plugin.applyMetadata(handler, info_json_1.default);
var main = handler;
var _default = handler;
main.default = _default;

module.exports = _default;
