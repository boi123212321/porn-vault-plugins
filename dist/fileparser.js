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
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchElement = exports.dateToTimestamp = void 0;
const dateToTimestamp = (ctx, textToParse) => {
    const { $logger, $moment } = ctx;
    if (!textToParse || textToParse === "")
        return;
    $logger.debug(`Attempting a date match in: ${textToParse}`);
    const dateStr = textToParse.replace(/_/g, "-");
    const yyyymmdd = /(\b(?:19|20)\d\d)[- /.](\b1[012]|0[1-9])[- /.](\b3[01]|[12]\d|0[1-9])/.exec(dateStr);
    const ddmmyyyy = /(\b3[01]|[12]\d|0[1-9])[- /.](\b1[012]|0[1-9])[- /.](\b(?:19|20)\d\d)/.exec(dateStr);
    const yymmdd = /(\b\d\d)[- /.](\b1[012]|0[1-9])[- /.](\b3[01]|[12]\d|0[1-9])/.exec(dateStr);
    const ddmmyy = /(\b3[01]|[12]\d|0[1-9])[- /.](\b1[012]|0[1-9])[- /.](\b\d\d)/.exec(dateStr);
    const yyyymm = /\b((?:19|20)\d\d)[- /.](\b1[012]|0[1-9])/.exec(dateStr);
    const mmyyyy = /(\b1[012]|0[1-9])[- /.](\b(?:19|20)\d\d)/.exec(dateStr);
    const yyyy = /(\b(?:19|20)\d\d)/.exec(dateStr);
    if (yyyymmdd && yyyymmdd.length) {
        const date = yyyymmdd[0].replace(/[- /.]/g, "-");
        $logger.debug("\tSUCCESS: Found => yyyymmdd");
        return $moment(date, "YYYY-MM-DD").valueOf();
    }
    if (ddmmyyyy && ddmmyyyy.length) {
        const date = ddmmyyyy[0].replace(/[- /.]/g, "-");
        $logger.debug("\tSUCCESS: Found => ddmmyyyy");
        return $moment(date, "DD-MM-YYYY").valueOf();
    }
    if (yymmdd && yymmdd.length) {
        const date = yymmdd[0].replace(/[- /.]/g, "-");
        $logger.debug("\tSUCCESS: Found => yymmdd");
        return $moment(date, "YY-MM-DD").valueOf();
    }
    if (ddmmyy && ddmmyy.length) {
        const date = ddmmyy[0].replace(/[- /.]/g, "-");
        $logger.debug("\tSUCCESS: Found => ddmmyy");
        return $moment(date, "DD-MM-YY").valueOf();
    }
    if (yyyymm && yyyymm.length) {
        const date = yyyymm[0].replace(/[- /.]/g, "-");
        $logger.debug("\tSUCCESS: Found => yyyymm");
        return $moment(date, "YYYY-MM").valueOf();
    }
    if (mmyyyy && mmyyyy.length) {
        const date = mmyyyy[0].replace(/[- /.]/g, "-");
        $logger.debug("\tSUCCESS: Found => mmyyyy");
        return $moment(date, "MM-YYYY").valueOf();
    }
    if (yyyy && yyyy.length) {
        const date = yyyy[0];
        $logger.debug("\tSUCCESS: Found => yyyy");
        return $moment(date, "YYYY").valueOf();
    }
    $logger.debug("\tFAILED: Could not find a date");
};
exports.dateToTimestamp = dateToTimestamp;
function matchElement(ctx, matcher) {
    var _a, _b;
    const { $logger, $path, scenePath } = ctx;
    if (!matcher)
        return;
    const toMatch = matcher.scopeDirname ? $path.dirname(scenePath) : $path.parse(scenePath).name;
    const regex = new RegExp(matcher.regex, "gm");
    const matchesIterable = toMatch.matchAll(regex);
    const matchedResult = [];
    if (!matchesIterable) {
        $logger.info(`No matches in ${toMatch} with regex /${regex}/. Check your config to make sure it matches your files.`);
        return;
    }
    const matches = Array.from(matchesIterable);
    const matchesToUse = (_a = matcher.matchesToUse) !== null && _a !== void 0 ? _a : [1];
    const groupsToUse = (_b = matcher.groupsToUse) !== null && _b !== void 0 ? _b : [2];
    const useAllMatches = matchesToUse.includes(0);
    const useAllGroups = groupsToUse.includes(0);
    matches.forEach((match, i) => {
        if (!useAllMatches && !matchesToUse.includes(i + 1)) {
            $logger.debug(`Skipping match not to be used: [${i + 1}] ${JSON.stringify(match)}`);
            return;
        }
        let groups = match;
        if (!useAllGroups && groups.length > 1) {
            groups = match.filter((group, j) => groupsToUse.includes(j + 1));
            $logger.debug(`Using group(s) ${groupsToUse}: ${JSON.stringify(groups)}`);
        }
        matchedResult.push(...getSplitResults(groups.join(" "), matcher.splitter));
    });
    $logger.debug(`Final matched result: "${JSON.stringify(matchedResult)}"`);
    return matchedResult;
}
exports.matchElement = matchElement;
function getSplitResults(text, splitter) {
    if (splitter && splitter !== "") {
        return text.split(splitter).map((s) => s.trim());
    }
    else {
        return [text.trim()];
    }
}
});

var config = createCommonjsModule(function (module, exports) {
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
exports.isValidConfig = exports.findAndLoadSceneConfig = void 0;
const configFilename = "parserconfig";
const configYAMLFilename = `${configFilename}.yaml`;
const configJSONFilename = `${configFilename}.json`;
function findAndLoadSceneConfig(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const { $fs, $logger, $path, scenePath, $yaml } = ctx;
        const configFile = findConfig(ctx, $path.dirname(scenePath));
        if (configFile) {
            $logger.info(`Parsing scene '${scenePath}' using config '${configFile}'`);
            let loadedConfig;
            try {
                if ($path.extname(configFile).toLowerCase() === ".yaml") {
                    loadedConfig = $yaml.parse($fs.readFileSync(configFile, "utf-8"));
                }
                else {
                    loadedConfig = JSON.parse($fs.readFileSync(configFile, "utf-8"));
                }
            }
            catch (error) {
                $logger.warn(`Invalid config schema. Unable to parse "${configFile}". Double check your config and retry.`);
                $logger.error(error);
                return;
            }
            const validationError = isValidConfig(ctx, loadedConfig);
            if (validationError !== true) {
                $logger.warn(`Invalid config schema. Unable to validate content near "${validationError.location}". Double check your config and retry.`);
                $logger.error(validationError.error.message);
                return;
            }
            return loadedConfig;
        }
    });
}
exports.findAndLoadSceneConfig = findAndLoadSceneConfig;
const findConfig = (ctx, dirName) => {
    const { $fs, $library, $logger, $path } = ctx;
    try {
        const configFileYAML = $path.format({ dir: dirName, base: configYAMLFilename });
        if ($fs.existsSync(configFileYAML)) {
            $logger.verbose(`Config file found: ${configFileYAML}`);
            return configFileYAML;
        }
        const configFileJSON = $path.format({ dir: dirName, base: configJSONFilename });
        if ($fs.existsSync(configFileJSON)) {
            $logger.verbose(`Config file found: ${configFileJSON}`);
            return configFileJSON;
        }
        if (dirName === $library || dirName === $path.parse(dirName).root) {
            $logger.verbose(`Could not find a config file in the library.`);
            return;
        }
        else {
            const parentDir = $path.resolve(dirName, "..");
            return findConfig(ctx, parentDir);
        }
    }
    catch (error) {
        $logger.error(`Error finding config file: ${error}. Stopped looking.`);
    }
};
function isValidConfig(ctx, val) {
    const { $zod } = ctx;
    let generalError = null;
    const location = "root";
    const fileParserSchemaElem = $zod.object({
        scopeDirname: $zod.boolean().optional(),
        regex: $zod.string(),
        matchesToUse: $zod.array($zod.number()).optional(),
        groupsToUse: $zod.array($zod.number()).optional(),
        splitter: $zod.string().optional(),
    });
    const configSchema = $zod.object({
        studioMatcher: fileParserSchemaElem.optional(),
        nameMatcher: fileParserSchemaElem.optional(),
        actorsMatcher: fileParserSchemaElem.optional(),
        movieMatcher: fileParserSchemaElem.optional(),
        labelsMatcher: fileParserSchemaElem.optional(),
    });
    try {
        configSchema.parse(val);
    }
    catch (err) {
        generalError = err;
    }
    return generalError ? { location: location, error: generalError } : true;
}
exports.isValidConfig = isValidConfig;
});

var name = "fileparser";
var version = "0.2.0";
var authors = [
	"arcadianCdr"
];
var description = "Automatically extracts scene details from your library's file and directory structure. Supported properties: release date, studio, name, actors, movie and labels.";
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
		description: "Whether to commit data changes."
	},
	{
		name: "parseDate",
		type: "Boolean",
		required: false,
		"default": true,
		description: "whether to parse release dates. Defaults to true."
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
const handler = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const { args, scenePath, $logger, $path, $throw } = ctx;
    if (!scenePath)
        $throw("Uh oh. You shouldn't use the plugin for this type of event");
    const sceneName = $path.parse(scenePath).name;
    const cfg = yield config.findAndLoadSceneConfig(ctx);
    if (!cfg) {
        $logger.warn(`No configuration found in the scene directory or a parent => only 'release date' will be parsed.`);
    }
    function parseReleaseDate() {
        if (args.parseDate === false)
            return {};
        const dateFromName = utils.dateToTimestamp(ctx, sceneName);
        if (dateFromName) {
            $logger.verbose(`Found date in scene name: ${new Date(dateFromName).toLocaleDateString()}`);
            return { releaseDate: dateFromName };
        }
        $logger.verbose("Could not find a date.");
        return {};
    }
    function parseName() {
        if (!cfg || !cfg.nameMatcher)
            return {};
        const matched = utils.matchElement(ctx, cfg.nameMatcher);
        if (matched) {
            $logger.verbose(`Matched name: ${matched}`);
            return { name: matched.toString().trim() };
        }
        $logger.verbose(`Found no name.`);
        return {};
    }
    function parseStudio() {
        if (!cfg || !cfg.studioMatcher)
            return {};
        const matched = utils.matchElement(ctx, cfg.studioMatcher);
        if (matched) {
            $logger.verbose(`Matched studio: ${matched}`);
            return { studio: matched.toString().trim() };
        }
        $logger.verbose(`Found no studio.`);
        return {};
    }
    function parseActors() {
        if (!cfg || !cfg.actorsMatcher)
            return {};
        const matched = utils.matchElement(ctx, cfg.actorsMatcher);
        if (matched) {
            $logger.verbose(`Matched actor(s): ${matched}`);
            return { actors: matched };
        }
        $logger.verbose(`Found no actor.`);
        return {};
    }
    function parseMovie() {
        if (!cfg || !cfg.movieMatcher)
            return {};
        const matched = utils.matchElement(ctx, cfg.movieMatcher);
        if (matched) {
            $logger.verbose(`Matched movie: ${matched}`);
            return { movie: matched.toString().trim() };
        }
        $logger.verbose(`Found no movie.`);
        return {};
    }
    function parseLabels() {
        if (!cfg || !cfg.labelsMatcher)
            return {};
        const matched = utils.matchElement(ctx, cfg.labelsMatcher);
        if (matched) {
            $logger.verbose(`Matched label(s): ${matched}`);
            return { labels: matched };
        }
        $logger.verbose(`Found no label.`);
        return {};
    }
    const sceneOutput = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, parseReleaseDate()), parseStudio()), parseName()), parseActors()), parseMovie()), parseLabels());
    if (args.dry === true) {
        $logger.info(`dry mode. Would have returned: ${sceneOutput}`);
        return {};
    }
    else {
        if (Object.keys(sceneOutput).length) {
            $logger.info(`Successfully matched scene: ${sceneOutput.name}`);
        }
        else {
            $logger.info(`Could not match anything for scene: ${sceneName}`);
        }
        return sceneOutput;
    }
});
handler.requiredVersion = ">=0.27.0";
plugin.applyMetadata(handler, info_json_1.default);
var main = handler;
var _default = handler;
main.default = _default;

module.exports = _default;
