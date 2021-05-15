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

var api = createCommonjsModule(function (module, exports) {
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
exports.Api = void 0;
class Api {
    constructor(ctx) {
        this.ctx = ctx;
        this.axios = ctx.$axios.create({
            baseURL: "https://api.metadataapi.net/api",
            headers: { Authorization: `Bearer ${ctx.args.apiKey}` },
        });
    }
    parseScene(parse) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ctx.$logger.verbose(`GET: https://api.metadataapi.net/api/scenes?parse=${encodeURIComponent(parse)}`);
            return this.axios.get("/scenes", {
                params: {
                    parse,
                },
            });
        });
    }
    getSceneById(sceneId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.axios.get(`/scenes/${sceneId}`);
        });
    }
    getSites() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.axios.get("/sites");
        });
    }
}
exports.Api = Api;
});

var levenshtein = function levenshtein(a, b) {
    if (a.length === 0)
        return b.length;
    if (b.length === 0)
        return a.length;
    const matrix = [];
    let i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    let j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
};

var util = createCommonjsModule(function (module, exports) {
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
exports.checkSceneExistsInDb = exports.normalizeSceneResultData = exports.matchSceneResultToPipedData = exports.matchSceneResultToSearch = exports.ignoreDbLine = exports.createQuestionPrompter = exports.escapeRegExp = exports.stripStr = exports.dateToTimestamp = exports.timestampToString = exports.isPositiveAnswer = exports.manualTouchChoices = void 0;
exports.manualTouchChoices = {
    MANUAL_ENTER: "Enter scene details manually, straight into the porn-vault",
    NOTHING: "Do nothing (let the scene be imported with no details)",
    SEARCH: "Search scene details on The Porn Database (TPD)",
};
const isPositiveAnswer = (answer = "") => ["y", "yes"].includes(answer.toLowerCase());
exports.isPositiveAnswer = isPositiveAnswer;
function timestampToString(timestamp) {
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
exports.timestampToString = timestampToString;
const dateToTimestamp = (ctx, dateStr) => {
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
exports.dateToTimestamp = dateToTimestamp;
function stripStr(str, keepDate = false) {
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
exports.stripStr = stripStr;
function escapeRegExp(string) {
    var _a;
    return (_a = string === null || string === void 0 ? void 0 : string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&")) !== null && _a !== void 0 ? _a : "";
}
exports.escapeRegExp = escapeRegExp;
const createQuestionPrompter = (inquirer, testingStatus, $logger) => {
    const questionAsync = (promptArgs) => __awaiter(void 0, void 0, void 0, function* () {
        if (testingStatus) {
            $logger.info(`TESTMODE: ${JSON.stringify(promptArgs.name)} => ${JSON.stringify(promptArgs.testAnswer)}`);
            return { [promptArgs.name]: promptArgs.testAnswer };
        }
        return inquirer.prompt(promptArgs);
    });
    return questionAsync;
};
exports.createQuestionPrompter = createQuestionPrompter;
const ignoreDbLine = (line) => {
    if (!line) {
        return true;
    }
    try {
        const parsed = JSON.parse(line);
        return parsed.$$deleted;
    }
    catch (err) {
        return true;
    }
};
exports.ignoreDbLine = ignoreDbLine;
const matchSceneResultToSearch = (ctx, sceneList, knownActors, studio) => {
    ctx.$logger.verbose(`MATCH: ${sceneList.length} results found`);
    for (const scene of sceneList) {
        ctx.$logger.verbose(`MATCH:\tTrying to match TPD title: ${JSON.stringify(scene.title)} --with--> ${JSON.stringify(ctx.sceneName)}`);
        let searchedTitle = stripStr(ctx.sceneName).toLowerCase();
        let matchTitle = stripStr(scene.title || "").toLowerCase();
        if (!matchTitle) {
            continue;
        }
        for (const actor of knownActors) {
            if (actor) {
                searchedTitle = searchedTitle.replace(actor.toLowerCase(), "");
                matchTitle = matchTitle.replace(actor.toLowerCase(), "");
            }
        }
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
                    ctx.$logger.verbose(`MATCH:\t\tSUCCESS: ${JSON.stringify(searchedTitle)} did match to ${JSON.stringify(matchTitle)}`);
                    return scene;
                }
            }
        }
    }
    ctx.$logger.error(`MATCH:\tERR: did not find any match`);
    return null;
};
exports.matchSceneResultToSearch = matchSceneResultToSearch;
function cleanup(text) {
    return text.replace(/[^\w\d]/g, "");
}
function checkActorMatch(performers, actors) {
    let isActorsMatch = false;
    if ((performers === null || performers === void 0 ? void 0 : performers.length) && (actors === null || actors === void 0 ? void 0 : actors.length)) {
        isActorsMatch = actors.every((actor) => performers.filter(({ name }) => name.localeCompare(actor, undefined, { sensitivity: "base" }) === 0));
    }
    return isActorsMatch;
}
function checkStudioMatch(site, studio) {
    let isStudioMatch = false;
    if ((site === null || site === void 0 ? void 0 : site.name) && studio) {
        isStudioMatch =
            cleanup(site.name).localeCompare(cleanup(studio), undefined, { sensitivity: "base" }) === 0;
    }
    return isStudioMatch;
}
const matchSceneResultToPipedData = (ctx, sceneList) => {
    var _a, _b, _c, _d;
    const { data, $formatMessage, $moment } = ctx;
    ctx.$logger.verbose(`MATCH PIPED: ${sceneList.length} results found`);
    const sceneMatchingScores = [];
    for (const scene of sceneList) {
        const foundTitle = stripStr(scene.title || "").trim();
        const searchedTitle = stripStr((_b = (_a = data.name) !== null && _a !== void 0 ? _a : data.movie) !== null && _b !== void 0 ? _b : "").trim();
        const isTitleMatch = foundTitle.localeCompare(searchedTitle, undefined, { sensitivity: "base" }) === 0;
        const isActorsMatch = checkActorMatch(scene.performers, data.actors);
        const isDateMatch = $moment(scene.date, "YYYY-MM-DD").valueOf() === data.releaseDate;
        const isStudioMatch = checkStudioMatch(scene.site, data.studio);
        let confidenceScore = 0.0;
        if (isTitleMatch && isActorsMatch) {
            confidenceScore = 1.0;
        }
        else if (isTitleMatch) {
            confidenceScore = 0.8;
        }
        else if (isActorsMatch && isDateMatch && isStudioMatch) {
            confidenceScore = 0.7;
        }
        else if (isActorsMatch && isDateMatch) {
            confidenceScore = 0.3;
        }
        sceneMatchingScores.push(confidenceScore);
        ctx.$logger.verbose(`MATCH PIPED: Trying to match TPD scene:\n${$formatMessage({
            studio: (_c = scene.site) === null || _c === void 0 ? void 0 : _c.name,
            title: foundTitle,
            actors: (_d = scene.performers) === null || _d === void 0 ? void 0 : _d.map((performer) => performer.name),
            releaseDate: scene.date,
        })}\nConfidence score for this scene: ${confidenceScore}`);
    }
    const indexOfMax = sceneMatchingScores.indexOf(Math.max(...sceneMatchingScores));
    if (sceneMatchingScores[indexOfMax] > 0) {
        ctx.$logger.verbose(`MATCH PIPED: SUCCESS: matched with a confidence score of ${sceneMatchingScores[indexOfMax]} to TPDB scene: ${sceneList[indexOfMax].title}`);
        return sceneList[indexOfMax];
    }
    ctx.$logger.error(`MATCH PIPED:\tERR: did not find any match`);
    return null;
};
exports.matchSceneResultToPipedData = matchSceneResultToPipedData;
const normalizeSceneResultData = (sceneData) => {
    var _a;
    const result = {};
    if (sceneData.title) {
        result.name = sceneData.title;
    }
    if (sceneData.description) {
        result.description = sceneData.description;
    }
    if (sceneData.date) {
        result.releaseDate = new Date(sceneData.date).getTime();
    }
    if ((_a = sceneData.tags) === null || _a === void 0 ? void 0 : _a.length) {
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
exports.normalizeSceneResultData = normalizeSceneResultData;
const checkSceneExistsInDb = (ctx, sceneTitle) => {
    var _a, _b, _c;
    if (!sceneTitle || !((_a = ctx.args) === null || _a === void 0 ? void 0 : _a.sceneDuplicationCheck) || !((_c = (_b = ctx.args) === null || _b === void 0 ? void 0 : _b.source_settings) === null || _c === void 0 ? void 0 : _c.scenes)) {
        return;
    }
    let foundDupScene = false;
    const lines = ctx.$fs.readFileSync(ctx.args.source_settings.scenes, "utf8").split("\n");
    let line = lines.shift();
    while (!foundDupScene && line) {
        if (exports.ignoreDbLine(line) || !stripStr(JSON.parse(line).name.toString())) {
            line = lines.shift();
            continue;
        }
        const matchSceneRegexes = [
            escapeRegExp(stripStr(JSON.parse(line).name.toString())),
            escapeRegExp(stripStr(JSON.parse(line).name.toString()).replace(/ /g, "")),
        ].map((str) => new RegExp(str, "gi"));
        if (matchSceneRegexes.some((regex) => regex.test(stripStr(sceneTitle)))) {
            foundDupScene = true;
            break;
        }
        line = lines.shift();
    }
    if (foundDupScene) {
        ctx.$logger.warn("Title Duplication check: Found a possible duplicate title in the database");
    }
    else {
        ctx.$logger.verbose("Title Duplication check: Did not find any possible duplicate title");
    }
};
exports.checkSceneExistsInDb = checkSceneExistsInDb;
});

var parse = createCommonjsModule(function (module, exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSceneTimestamp = exports.parseSceneStudio = exports.parseSceneActor = void 0;
const levenshtein_1 = __importDefault(levenshtein);

const parseSceneActor = (ctx) => {
    var _a, _b, _c;
    if (!((_a = ctx.args) === null || _a === void 0 ? void 0 : _a.parseActor) || !((_c = (_b = ctx.args) === null || _b === void 0 ? void 0 : _b.source_settings) === null || _c === void 0 ? void 0 : _c.actors)) {
        return null;
    }
    const cleanScenePath = util.stripStr(ctx.scenePath);
    const allDbActors = [];
    let parsedDbActor = null;
    ctx.$logger.verbose(`Parsing Actors DB ==> ${ctx.args.source_settings.actors}`);
    ctx.$fs
        .readFileSync(ctx.args.source_settings.actors, "utf8")
        .split("\n")
        .forEach((line) => {
        if (util.ignoreDbLine(line)) {
            return;
        }
        const matchActor = new RegExp(util.escapeRegExp(JSON.parse(line).name), "i");
        const actorLength = matchActor.toString().split(" ");
        if (actorLength.length < 2) {
            return;
        }
        const foundActorMatch = cleanScenePath.match(matchActor);
        if (foundActorMatch !== null) {
            allDbActors.push(JSON.parse(line).name);
            return;
        }
        const allAliases = JSON.parse(line).aliases.toString().split(",");
        allAliases.forEach((personAlias) => {
            const aliasLength = personAlias.toString().split(" ");
            if (aliasLength.length < 2) {
                return;
            }
            let matchAliasActor = new RegExp(util.escapeRegExp(personAlias), "i");
            let foundAliasActorMatch = cleanScenePath.match(matchAliasActor);
            if (foundAliasActorMatch !== null) {
                allDbActors.push("alias:" + JSON.parse(line).name);
            }
            else {
                const aliasNoSpaces = personAlias.toString().replace(" ", "");
                matchAliasActor = new RegExp(util.escapeRegExp(aliasNoSpaces), "i");
                foundAliasActorMatch = cleanScenePath.match(matchAliasActor);
                if (foundAliasActorMatch !== null) {
                    allDbActors.push("alias:" + JSON.parse(line).name);
                }
            }
        });
    });
    let actorHighScore = 5000;
    allDbActors.forEach((person) => {
        let foundAnAlias = false;
        if (person.includes("alias:")) {
            person = person.toString().replace("alias:", "").trim();
            foundAnAlias = true;
        }
        const found = levenshtein_1.default(person.toString().toLowerCase(), cleanScenePath);
        if (found < actorHighScore) {
            actorHighScore = found;
            parsedDbActor = person;
        }
        if (foundAnAlias) {
            ctx.$logger.verbose(`SUCCESS Found Actor-Alias: ${JSON.stringify(person)}`);
        }
        else {
            ctx.$logger.verbose(`SUCCESS Found Actor: ${JSON.stringify(person)}`);
        }
    });
    ctx.$logger.verbose(`\tUsing "best match" Actor For Search: ${JSON.stringify(parsedDbActor)}`);
    return parsedDbActor;
};
exports.parseSceneActor = parseSceneActor;
const parseSceneStudio = (ctx) => {
    var _a, _b, _c;
    if (!((_a = ctx.args) === null || _a === void 0 ? void 0 : _a.parseStudio) || !((_c = (_b = ctx.args) === null || _b === void 0 ? void 0 : _b.source_settings) === null || _c === void 0 ? void 0 : _c.studios)) {
        return null;
    }
    ctx.$logger.verbose(`Parsing Studios DB ==> ${JSON.stringify(ctx.args.source_settings.studios)}`);
    const cleanScenePath = util.stripStr(ctx.scenePath);
    const allDbStudios = [];
    let parsedDbStudio = null;
    ctx.$fs
        .readFileSync(ctx.args.source_settings.studios, "utf8")
        .split("\n")
        .forEach((line) => {
        if (util.ignoreDbLine(line)) {
            return;
        }
        if (!JSON.parse(line).name) {
            return;
        }
        let matchStudio = new RegExp(util.escapeRegExp(JSON.parse(line).name), "i");
        const foundStudioMatch = cleanScenePath.match(matchStudio);
        if (foundStudioMatch !== null) {
            allDbStudios.push(JSON.parse(line).name);
        }
        else if (JSON.parse(line).name !== null) {
            matchStudio = new RegExp(util.escapeRegExp(JSON.parse(line).name.replace(/ /g, "")), "i");
            const foundStudioMatch = cleanScenePath.match(matchStudio);
            if (foundStudioMatch !== null) {
                allDbStudios.push(JSON.parse(line).name);
            }
        }
        if (!JSON.parse(line).aliases) {
            return;
        }
        const allStudioAliases = JSON.parse(line).aliases.toString().split(",");
        allStudioAliases.forEach((studioAlias) => {
            if (studioAlias) {
                let matchAliasStudio = new RegExp(util.escapeRegExp(studioAlias), "i");
                let foundAliasStudioMatch = cleanScenePath.match(matchAliasStudio);
                if (foundAliasStudioMatch !== null) {
                    allDbStudios.push("alias:" + JSON.parse(line).name);
                }
                else {
                    const aliasNoSpaces = studioAlias.toString().replace(" ", "");
                    matchAliasStudio = new RegExp(util.escapeRegExp(aliasNoSpaces), "i");
                    foundAliasStudioMatch = cleanScenePath.match(matchAliasStudio);
                    if (foundAliasStudioMatch !== null) {
                        allDbStudios.push("alias:" + JSON.parse(line).name);
                    }
                }
            }
        });
    });
    let studioHighScore = 5000;
    let foundStudioAnAlias = false;
    let instanceFoundStudioAnAlias = false;
    allDbStudios.forEach((stud) => {
        if (stud.includes("alias:")) {
            stud = stud.toString().replace("alias:", "").trim();
            instanceFoundStudioAnAlias = true;
        }
        const found = levenshtein_1.default(stud.toString().toLowerCase(), cleanScenePath);
        if (found < studioHighScore) {
            studioHighScore = found;
            parsedDbStudio = stud;
            foundStudioAnAlias = instanceFoundStudioAnAlias;
        }
        if (foundStudioAnAlias) {
            ctx.$logger.verbose(`\tSUCCESS: Found Studio-Alias: ${JSON.stringify(parsedDbStudio)}`);
        }
        else {
            ctx.$logger.verbose(`\tSUCCESS: Found Studio: ${JSON.stringify(parsedDbStudio)}`);
        }
    });
    ctx.$logger.verbose(`\tUsing "best match" Studio For Search: ${JSON.stringify(parsedDbStudio)}`);
    return parsedDbStudio;
};
exports.parseSceneStudio = parseSceneStudio;
const parseSceneTimestamp = (ctx) => {
    if (!ctx.args.parseDate) {
        return null;
    }
    const cleanScenePath = util.stripStr(ctx.scenePath, true);
    return util.dateToTimestamp(ctx, cleanScenePath);
};
exports.parseSceneTimestamp = parseSceneTimestamp;
});

var name = "PromisedScene";
var version = "0.4.1";
var authors = [
	"Ch00nassid a.k.a: DGs.Ch00",
	"leadwolf"
];
var description = "Ask questions and make sure scene parsing is correct";
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
		name: "apiKey",
		type: "String",
		required: true,
		"default": "INSERT_KEY",
		description: "Your TPDB api key"
	},
	{
		name: "useTitleInSearch",
		type: "Boolean",
		required: false,
		"default": false,
		description: "When searching TPDB: in auto search, if should use existing scene title. In manual user search, if should prompt user for title and use in search"
	},
	{
		name: "alwaysUseSingleResult",
		type: "Boolean",
		required: false,
		"default": false,
		description: "When searching TPDB, if there is **only** 1 result, even if its title **doesn't** match the searched title, if should return that data"
	},
	{
		name: "usePipedInputInSearch",
		type: "Boolean",
		required: false,
		"default": false,
		description: "This option is only relevant when PromisedScene is chained from another plugin (piped data are set). If true, the piped data take precedence for the search. If false, the piped data are ignored."
	},
	{
		name: "parseActor",
		type: "Boolean",
		required: true,
		"default": true,
		description: "Try to find the Actor name in your database within the scenePath string"
	},
	{
		name: "parseStudio",
		type: "Boolean",
		required: true,
		"default": true,
		description: "Try to find the Studio name in your database within the scenePath string"
	},
	{
		name: "parseDate",
		type: "Boolean",
		required: true,
		"default": true,
		description: "Try to find the date within the scenePath string"
	},
	{
		name: "manualTouch",
		type: "Boolean",
		required: true,
		"default": true,
		description: "If true, will allow you to answer questions to manually enter scene data, manually search TPDB, confirm the final result"
	},
	{
		name: "sceneDuplicationCheck",
		type: "Boolean",
		required: true,
		"default": true,
		description: "Will notify you of a possible duplicate title that is being imported.  Will not currently stop / correct anything"
	},
	{
		name: "source_settings.actors",
		type: "String",
		required: true,
		"default": "./library/actors.db",
		description: "finds the DB file for Actors to determine which actors are currently in your collection"
	},
	{
		name: "source_settings.studios",
		type: "String",
		required: true,
		"default": "./library/studios.db",
		description: "finds the DB file for Studios to determine which Studios are currently in your collection"
	},
	{
		name: "source_settings.scenes",
		type: "String",
		required: true,
		"default": "./library/scenes.db",
		description: "finds the DB file for Scenes to determine which Scenes are currently in your collection"
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const { event, scene, scenePath, sceneName, $throw, $logger, $formatMessage, testMode, args, $inquirer, $createImage, data, } = ctx;
    let didRunMakeChoices = false;
    if (event !== "sceneCreated" && event !== "sceneCustom") {
        $throw("Plugin used for unsupported event");
    }
    if (!Object.hasOwnProperty.call(args, "usePipedInputInSearch")) {
        args.usePipedInputInSearch = false;
    }
    const envApiKey = process.env.TPDB_API_KEY;
    if (!Object.hasOwnProperty.call(args, "apiKey")) {
        if (envApiKey) {
            args.apiKey = process.env.TPDB_API_KEY;
        }
        else {
            $throw("Missing apiKey in plugin args!");
        }
    }
    if (!Object.hasOwnProperty.call(args, "useTitleInSearch")) {
        $logger.warn("Missing useTitleInSearch in plugin args!");
    }
    if (!Object.hasOwnProperty.call(args, "alwaysUseSingleResult")) {
        $logger.warn("Missing alwaysUseSingleResult in plugin args!");
    }
    if (!Object.hasOwnProperty.call(args, "source_settings")) {
        $throw("Missing source_settings in plugin args");
    }
    if (!Object.hasOwnProperty.call(args, "parseActor")) {
        $throw("Missing parseActor in plugin args");
    }
    if (!Object.hasOwnProperty.call(args, "parseStudio")) {
        $throw("Missing parseStudio in plugin args");
    }
    if (!Object.hasOwnProperty.call(args, "parseDate")) {
        $throw("Missing parseStudio in plugin args");
    }
    if (!Object.hasOwnProperty.call(args, "manualTouch")) {
        $throw("Missing manualTouch in plugin args");
    }
    if (!Object.hasOwnProperty.call(args, "sceneDuplicationCheck")) {
        $throw("Missing sceneDuplicationCheck in plugin args");
    }
    const tpdbApi = new api.Api(ctx);
    $logger.info(`STARTING to analyze scene: ${JSON.stringify(scenePath)}`);
    let searchTitle;
    let searchActors = [];
    let searchStudio;
    let searchTimestamp;
    let userMovie;
    let extra;
    if (args.usePipedInputInSearch && Object.keys(data).length) {
        searchTitle = (_a = data.name) !== null && _a !== void 0 ? _a : data.movie;
        searchActors = (_b = data.actors) !== null && _b !== void 0 ? _b : [];
        searchStudio = data.studio;
        searchTimestamp = data.releaseDate;
        userMovie = data.movie;
        $logger.verbose(`Piped data from the previous plugin take precedence for the search: ${$formatMessage({
            searchTitle: searchTitle,
            searchActors: searchActors,
            searchStudio: searchStudio,
            searchTimestamp: ctx.$moment(searchTimestamp).format("YYYY-MM-DD"),
            userMovie: userMovie,
        })}`);
    }
    searchTitle !== null && searchTitle !== void 0 ? searchTitle : (searchTitle = sceneName);
    searchTimestamp !== null && searchTimestamp !== void 0 ? searchTimestamp : (searchTimestamp = (_d = (_c = scene.releaseDate) !== null && _c !== void 0 ? _c : parse.parseSceneTimestamp(ctx)) !== null && _d !== void 0 ? _d : undefined);
    searchStudio !== null && searchStudio !== void 0 ? searchStudio : (searchStudio = (_f = (_e = (yield ctx.$getStudio())) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : parse.parseSceneStudio(ctx));
    if (!searchActors.length) {
        searchActors = (_h = (_g = (yield ctx.$getActors())) === null || _g === void 0 ? void 0 : _g.map((a) => a.name)) !== null && _h !== void 0 ? _h : [];
        if (!searchActors.length) {
            const parsedDbActor = parse.parseSceneActor(ctx);
            searchActors = parsedDbActor ? [parsedDbActor] : [];
        }
    }
    userMovie !== null && userMovie !== void 0 ? userMovie : (userMovie = (_k = (_j = (yield ctx.$getMovies())) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.name);
    const gotResultOrExit = false;
    do {
        const searchResult = yield doASearch({
            title: searchTitle,
            actors: searchActors,
            studio: searchStudio,
            timestamp: searchTimestamp,
            extra,
        });
        if (searchResult) {
            if (!searchResult.movie && userMovie) {
                searchResult.movie = userMovie;
            }
            const confirmedData = yield confirmFinalEntry(searchResult);
            if (confirmedData) {
                return confirmedData;
            }
        }
        const action = yield makeChoices();
        if (!action || action === util.manualTouchChoices.NOTHING) {
            return {};
        }
        else if (action === util.manualTouchChoices.MANUAL_ENTER) {
            const manualData = yield manualImport();
            const confirmedData = yield confirmFinalEntry(manualData);
            if (confirmedData) {
                return confirmedData;
            }
        }
        else if (action === util.manualTouchChoices.SEARCH) {
            const userSearchChoices = yield getNextSearchChoices();
            searchTitle = userSearchChoices.title;
            searchActors = userSearchChoices.actors || [];
            searchStudio = userSearchChoices.studio;
            searchTimestamp = userSearchChoices.timestamp;
            userMovie = userSearchChoices.movie;
            extra = userSearchChoices.extra;
        }
    } while (!gotResultOrExit);
    return {};
    function logResultObject(results) {
        var _a;
        $logger.info("====  Final Entry =====");
        const logObj = Object.assign({}, results);
        if (logObj.releaseDate) {
            logObj.releaseDate = util.timestampToString((_a = logObj.releaseDate) !== null && _a !== void 0 ? _a : 0);
        }
        $logger.info(JSON.stringify(logObj, null, 2));
    }
    function confirmFinalEntry(sceneData) {
        return __awaiter(this, void 0, void 0, function* () {
            logResultObject(sceneData);
            if (!(args === null || args === void 0 ? void 0 : args.manualTouch)) {
                if (sceneData.thumbnail) {
                    try {
                        sceneData.thumbnail = yield $createImage(sceneData.thumbnail, sceneData.name || "", true);
                    }
                    catch (err) {
                        $logger.error(`Could not download scene thumbnail ${$formatMessage(err)}`);
                        delete sceneData.thumbnail;
                    }
                }
                return sceneData;
            }
            const questionAsync = util.createQuestionPrompter($inquirer, testMode === null || testMode === void 0 ? void 0 : testMode.status, $logger);
            const { correctImportInfo: resultsConfirmation } = yield questionAsync({
                type: "input",
                name: "correctImportInfo",
                message: "Is this the correct scene details to import? (y/N)",
                testAnswer: testMode ? testMode.correctImportInfo : "",
            });
            if (util.isPositiveAnswer(resultsConfirmation)) {
                if (sceneData.thumbnail) {
                    try {
                        sceneData.thumbnail = yield $createImage(sceneData.thumbnail, sceneData.name || "", true);
                    }
                    catch (err) {
                        $logger.error(`Could not download scene thumbnail ${$formatMessage(err)}`);
                        delete sceneData.thumbnail;
                    }
                }
                return sceneData;
            }
            return null;
        });
    }
    function manualImport() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        return __awaiter(this, void 0, void 0, function* () {
            const questionAsync = util.createQuestionPrompter($inquirer, testMode === null || testMode === void 0 ? void 0 : testMode.status, $logger);
            const result = {};
            const { isMovie: manualMovieAnswer } = yield questionAsync({
                type: "input",
                name: "isMovie",
                message: "Is this a Scene from a Movie / Set / Collection?: (y/N) ",
                testAnswer: (_b = (_a = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _a === void 0 ? void 0 : _a.enterMovie) !== null && _b !== void 0 ? _b : "",
            });
            const manualEnterMovieSearch = util.isPositiveAnswer(manualMovieAnswer);
            if (manualEnterMovieSearch) {
                const { titleOfMovie: manualMovieName } = yield questionAsync({
                    type: "input",
                    name: "titleOfMovie",
                    message: "What is the Title of the Movie?: ",
                    testAnswer: (_d = (_c = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _c === void 0 ? void 0 : _c.movieTitle) !== null && _d !== void 0 ? _d : "",
                });
                if (manualMovieName) {
                    result.movie = manualMovieName;
                }
            }
            const { titleOfScene: manualEnterTitleScene } = yield questionAsync({
                type: "input",
                name: "titleOfScene",
                message: "What is the TITLE of the scene?: ",
                testAnswer: (_f = (_e = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _e === void 0 ? void 0 : _e.enterSceneTitle) !== null && _f !== void 0 ? _f : "",
            });
            result.name = manualEnterTitleScene;
            const { releaseDateOfScene: manualEnterReleaseDateScene } = yield questionAsync({
                type: "input",
                name: "releaseDateOfScene",
                message: "What is the RELEASE DATE of the scene (YYYY.MM.DD / DD.MM.YYYY / YY.MM.DD)?: ",
                testAnswer: (_h = (_g = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _g === void 0 ? void 0 : _g.enterSceneDate) !== null && _h !== void 0 ? _h : "",
            });
            if (manualEnterReleaseDateScene) {
                const parsedDate = util.dateToTimestamp(ctx, manualEnterReleaseDateScene);
                if (parsedDate) {
                    result.releaseDate = parsedDate;
                }
            }
            const { descriptionOfScene: manualEnterDescriptionOfScene } = yield questionAsync({
                type: "input",
                name: "descriptionOfScene",
                message: "What is the DESCRIPTION for the scene?: ",
                testAnswer: (_k = (_j = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _j === void 0 ? void 0 : _j.manualDescription) !== null && _k !== void 0 ? _k : "",
            });
            result.description = manualEnterDescriptionOfScene;
            const { actorsOfScene: splitActors } = yield questionAsync({
                type: "input",
                name: "actorsOfScene",
                message: `What are the Actors NAMES in the scene?: (separated by Comma)`,
                testAnswer: (_m = (_l = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _l === void 0 ? void 0 : _l.manualActors) !== null && _m !== void 0 ? _m : "",
                default() {
                    return searchActors ? ` ${searchActors.join(",")}` : "";
                },
            });
            if (splitActors && splitActors.trim()) {
                result.actors = splitActors.trim().split(",");
            }
            const { studioOfScene: askedStudio } = yield questionAsync({
                type: "input",
                name: "studioOfScene",
                message: `What Studio NAME is responsible for the scene?:`,
                testAnswer: (_p = (_o = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _o === void 0 ? void 0 : _o.enterStudioName) !== null && _p !== void 0 ? _p : "",
                default() {
                    return searchStudio ? ` ${searchStudio}` : "";
                },
            });
            if (askedStudio && askedStudio.trim()) {
                result.studio = askedStudio;
            }
            return result;
        });
    }
    function getNextSearchChoices() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        return __awaiter(this, void 0, void 0, function* () {
            let userTitle;
            let userTimestamp;
            let userMovie;
            let userActors = [];
            const questionAsync = util.createQuestionPrompter($inquirer, testMode === null || testMode === void 0 ? void 0 : testMode.status, $logger);
            const { movieSearch: movieAnswer } = yield questionAsync({
                type: "input",
                name: "movieSearch",
                message: "Is this a Scene from a Movie / Set / Collection?: (y/N) ",
                testAnswer: (_b = (_a = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _a === void 0 ? void 0 : _a.enterMovie) !== null && _b !== void 0 ? _b : "",
            });
            const enterMovieSearch = util.isPositiveAnswer(movieAnswer);
            if (enterMovieSearch) {
                const { manualMovieTitleSearch: movieName } = yield questionAsync({
                    type: "input",
                    name: "manualMovieTitleSearch",
                    message: "What is the Title of the Movie?: ",
                    testAnswer: (_d = (_c = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _c === void 0 ? void 0 : _c.movieTitle) !== null && _d !== void 0 ? _d : "",
                });
                if (movieName) {
                    userMovie = movieName;
                }
            }
            if (args.useTitleInSearch) {
                const { titleOfScene: manualEnterTitleScene } = yield questionAsync({
                    type: "input",
                    name: "titleOfScene",
                    message: "What is the TITLE of the scene?: ",
                    testAnswer: (_f = (_e = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _e === void 0 ? void 0 : _e.enterSceneTitle) !== null && _f !== void 0 ? _f : "",
                });
                if (manualEnterTitleScene && manualEnterTitleScene.trim()) {
                    userTitle = manualEnterTitleScene.trim();
                }
            }
            const { manualActorSearch: Q2Actor } = yield questionAsync({
                type: "input",
                name: "manualActorSearch",
                message: `What is ONE of the Actors NAME in the scene?:`,
                testAnswer: (_h = (_g = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _g === void 0 ? void 0 : _g.enterOneActorName) !== null && _h !== void 0 ? _h : "",
                default() {
                    return searchActors ? ` ${searchActors.join(",")}` : "";
                },
            });
            if (Q2Actor && Q2Actor.trim()) {
                if (Q2Actor.includes(",")) {
                    userActors = Q2Actor.split(",").map((str) => str.trim());
                }
                else {
                    userActors = [Q2Actor.trim()];
                }
            }
            const { manualStudioSearch: Q3Studio } = yield questionAsync({
                type: "input",
                name: "manualStudioSearch",
                message: `What Studio NAME is responsible for the scene?:`,
                testAnswer: (_k = (_j = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _j === void 0 ? void 0 : _j.enterStudioName) !== null && _k !== void 0 ? _k : "",
                default() {
                    return searchStudio ? ` ${searchStudio}` : "";
                },
            });
            const { extra } = yield questionAsync({
                type: "input",
                name: "extra",
                message: `What else should be in the search?:`,
                testAnswer: (_m = (_l = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _l === void 0 ? void 0 : _l.extra) !== null && _m !== void 0 ? _m : "",
            });
            const { manualDateSearch: Q4date } = yield questionAsync({
                type: "input",
                name: "manualDateSearch",
                message: "What is the release date (YYYY.MM.DD / DD.MM.YYYY / YY.MM.DD)?: (Blanks allowed) ",
                testAnswer: (_p = (_o = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _o === void 0 ? void 0 : _o.enterSceneDate) !== null && _p !== void 0 ? _p : "",
                default() {
                    if (!searchTimestamp) {
                        return "";
                    }
                    const dottedTimestamp = util.timestampToString(searchTimestamp).replace("-", ".");
                    if (dottedTimestamp && !isNaN(+dottedTimestamp)) {
                        return ` ${dottedTimestamp}`;
                    }
                    return "";
                },
            });
            if (Q4date) {
                const parsedDate = util.dateToTimestamp(ctx, Q4date);
                if (parsedDate) {
                    userTimestamp = parsedDate;
                }
            }
            return {
                title: userTitle,
                actors: userActors,
                studio: Q3Studio,
                timestamp: userTimestamp,
                movie: userMovie,
                extra,
            };
        });
    }
    function makeChoices() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!(args === null || args === void 0 ? void 0 : args.manualTouch)) {
                $logger.verbose(`"manualTouch" disabled, will continue plugin with current queries`);
                return util.manualTouchChoices.NOTHING;
            }
            if (didRunMakeChoices && testMode) {
                return util.manualTouchChoices.NOTHING;
            }
            try {
                const questionAsync = util.createQuestionPrompter($inquirer, testMode === null || testMode === void 0 ? void 0 : testMode.status, $logger);
                $logger.info(`"manualTouch" is enabled, prompting user for action`);
                const { choices: Q1Answer } = yield questionAsync({
                    type: "rawlist",
                    name: "choices",
                    message: "Would you like to:",
                    testAnswer: (_b = (_a = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _a === void 0 ? void 0 : _a.enterInfoSearch) !== null && _b !== void 0 ? _b : "",
                    choices: Object.values(util.manualTouchChoices),
                });
                didRunMakeChoices = true;
                if (!Object.values(util.manualTouchChoices).includes(Q1Answer)) {
                    $throw("User did not select a choice, will consider exit");
                    return util.manualTouchChoices.NOTHING;
                }
                return Q1Answer;
            }
            catch (error) {
                $logger.error(`Something went wrong asking for search questions ${$formatMessage(error)}`);
            }
            return util.manualTouchChoices.NOTHING;
        });
    }
    function doASearch({ title, actors, studio, timestamp, }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            function mergeSearchResult(rawScene) {
                return __awaiter(this, void 0, void 0, function* () {
                    util.checkSceneExistsInDb(ctx, rawScene.title);
                    const sceneData = util.normalizeSceneResultData(rawScene);
                    if ((!sceneData.actors || !sceneData.actors.length) &&
                        Array.isArray(actors) &&
                        actors.length) {
                        sceneData.actors = actors;
                    }
                    if (studio) {
                        sceneData.studio = studio;
                    }
                    return sceneData;
                });
            }
            const queries = [actors, studio, extra];
            if (args.useTitleInSearch) {
                queries.unshift(title);
            }
            if (!queries.flat().filter(Boolean).join("")) {
                $logger.warn("Did not have any parameters to do primary search");
                return null;
            }
            if (timestamp && !Number.isNaN(timestamp)) {
                queries.push(util.timestampToString(timestamp));
            }
            const initialQuery = queries.flat().filter(Boolean).join(" ");
            if (!initialQuery) {
                $logger.warn("Did not have any parameters to do primary search");
                return null;
            }
            let sceneList = [];
            try {
                $logger.verbose(`Running TPDB Primary Search on: ${JSON.stringify(initialQuery)}`);
                const apiRes = yield tpdbApi.parseScene(initialQuery);
                if (!(apiRes === null || apiRes === void 0 ? void 0 : apiRes.data) || (testMode === null || testMode === void 0 ? void 0 : testMode.testSiteUnavailable)) {
                    $throw("TPDB API: received no data");
                    return null;
                }
                sceneList = Array.isArray(apiRes.data.data) ? apiRes.data.data : [apiRes.data.data];
            }
            catch (err) {
                $logger.error(`TPDB API query failed ${$formatMessage(err)}`);
                if ((testMode === null || testMode === void 0 ? void 0 : testMode.status) && !(testMode === null || testMode === void 0 ? void 0 : testMode.testSiteUnavailable)) {
                    $logger.warn("!! This will impact the test if it was not expecting a failure !!");
                }
                return null;
            }
            if (!sceneList.length) {
                $logger.error("Did not find any results from TPDB");
                return null;
            }
            let matchedScene;
            if (args.usePipedInputInSearch && Object.keys(data).length) {
                matchedScene = util.matchSceneResultToPipedData(ctx, sceneList);
            }
            else {
                matchedScene = util.matchSceneResultToSearch(ctx, sceneList, searchActors, searchStudio);
            }
            if (matchedScene) {
                return mergeSearchResult(matchedScene);
            }
            else if (args.alwaysUseSingleResult && sceneList.length === 1) {
                $logger.verbose(`Did not match results to scene, but only 1 result was found and "alwaysUseSingleResult" is enabled. Returning it`);
                return mergeSearchResult(sceneList[0]);
            }
            $logger.error("Did not match any of the titles from TPDB");
            $logger.info("Scene is possibly one of multiple search results");
            if (!args.manualTouch) {
                $logger.info("ManualTouch is disabled, cannot automatically choose from multiple results");
                return null;
            }
            $logger.info("#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#");
            const answersList = [];
            const possibleTitles = [];
            for (const scene of sceneList) {
                answersList.push(scene.title);
                possibleTitles.push(scene.title);
            }
            const questionAsync = util.createQuestionPrompter($inquirer, testMode === null || testMode === void 0 ? void 0 : testMode.status, $logger);
            answersList.push(new $inquirer.Separator());
            answersList.push("== None of the above == ");
            const { searchedTitles: multipleSitesAnswer } = yield questionAsync({
                type: "rawlist",
                name: "searchedTitles",
                message: "Which Title would you like to use?",
                testAnswer: (_b = (_a = testMode === null || testMode === void 0 ? void 0 : testMode.questionAnswers) === null || _a === void 0 ? void 0 : _a.multipleChoice) !== null && _b !== void 0 ? _b : "",
                choices: answersList,
            });
            const findResultIndex = possibleTitles.indexOf(multipleSitesAnswer.trim());
            const userSelectedScene = sceneList[findResultIndex];
            if (!userSelectedScene) {
                $logger.info("User did not select a scene, exiting scene selection");
                return null;
            }
            return mergeSearchResult(userSelectedScene);
        });
    }
});
handler.requiredVersion = ">=0.27.0";
plugin.applyMetadata(handler, info_json_1.default);
var main = handler;
var _default = handler;
main.default = _default;

module.exports = _default;
