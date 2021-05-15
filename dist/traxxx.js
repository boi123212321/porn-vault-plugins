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
exports.buildImageUrls = exports.Api = void 0;
class Api {
    constructor(ctx) {
        this.ctx = ctx;
        this.axios = ctx.$axios.create({
            baseURL: "https://traxxx.me/api",
        });
    }
    getChannel(idOrSlug) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.axios.get(`/channels/${idOrSlug}`);
        });
    }
    getNetwork(idOrSlug) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.axios.get(`/networks/${idOrSlug}`);
        });
    }
    getAllEntities(idOrSlug) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchPromises = [];
            searchPromises.push(this.getChannel(idOrSlug)
                .then((res) => res.data.entity)
                .catch((err) => {
                var _a;
                const _err = err;
                if (((_a = _err.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                    this.ctx.$logger.verbose(`"${idOrSlug}" does not exist as a channel`);
                }
                else {
                    this.ctx.$throw(err);
                }
                return undefined;
            }));
            searchPromises.push(this.getNetwork(idOrSlug)
                .then((res) => res.data.entity)
                .catch((err) => {
                var _a;
                const _err = err;
                if (((_a = _err.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                    this.ctx.$logger.verbose(`"${idOrSlug}" does not exist as a network`);
                }
                else {
                    this.ctx.$throw(err);
                }
                return undefined;
            }));
            const [channel, network] = yield Promise.all(searchPromises);
            return {
                channel,
                network,
            };
        });
    }
}
exports.Api = Api;
const buildImageUrls = (entity) => {
    const baseUrl = "https://traxxx.me/img/logos/";
    return {
        logo: entity.logo ? `${baseUrl}${entity.logo}` : undefined,
        thumbnail: entity.thumbnail ? `${baseUrl}${entity.thumbnail}` : undefined,
        favicon: entity.favicon ? `${baseUrl}${entity.favicon}` : undefined,
    };
};
exports.buildImageUrls = buildImageUrls;
});

var util = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.suppressProp = exports.isOverrideBlacklisted = exports.propExistsInData = exports.isBlacklisted = exports.slugify = exports.stripAccents = exports.getEntityPreferenceFromName = exports.normalizeStudioName = exports.validateArgs = exports.hasProp = void 0;
const hasProp = (target, prop) => {
    return !!target && typeof target === "object" && Object.hasOwnProperty.call(target, prop);
};
exports.hasProp = hasProp;
const DEFAULT_STUDIO_SETTINGS = {
    channelPriority: true,
    uniqueNames: true,
    channelSuffix: "",
    networkSuffix: " (Network)",
    whitelist: [],
    blacklist: [],
    whitelistOverride: [],
    blacklistOverride: [],
    mergeAliases: true,
};
const validateArgs = ({ args, $throw, $logger, studioName, }) => {
    let validatedArgs;
    if (args && typeof args === "object") {
        validatedArgs = Object.assign({}, args);
    }
    if (!studioName || typeof studioName !== "string") {
        return $throw(`Missing "studioName", cannot run plugin`);
    }
    if (!validatedArgs || typeof validatedArgs !== "object") {
        return $throw(`Missing args, cannot run plugin`);
    }
    if (!validatedArgs.studios || typeof validatedArgs.studios !== "object") {
        $logger.verbose(`Missing "args.studios.channelPriority, setting to default: `, DEFAULT_STUDIO_SETTINGS);
        validatedArgs.studios = DEFAULT_STUDIO_SETTINGS;
    }
    else {
        validatedArgs.studios = Object.assign({}, validatedArgs.studios);
    }
    const studios = validatedArgs.studios;
    [
        { prop: "channelPriority", type: "boolean" },
        { prop: "uniqueNames", type: "boolean" },
        { prop: "channelSuffix", type: "string" },
        { prop: "networkSuffix", type: "string" },
        { prop: "mergeAliases", type: "boolean" },
    ].forEach((propCheck) => {
        if (!exports.hasProp(studios, propCheck.prop)) {
            $logger.verbose(`Missing "args.studios.${propCheck.prop}", setting to default: "${DEFAULT_STUDIO_SETTINGS[propCheck.prop]}"`);
            studios[propCheck.prop] = DEFAULT_STUDIO_SETTINGS[propCheck.prop];
        }
        else if (typeof studios[propCheck.prop] !== propCheck.type) {
            return $throw(`"args.studios.${propCheck.prop}" is not a ${propCheck.type}, cannot run plugin"`);
        }
    });
    if (validatedArgs.studios.channelSuffix === validatedArgs.studios.networkSuffix) {
        return $throw(`"args.studios.channelSuffix" and "args.studios.networkSuffix" are identical, cannot run plugin`);
    }
    ["whitelist", "blacklist", "whitelistOverride", "blacklistOverride"].forEach((arrayProp) => {
        const arr = studios[arrayProp];
        if (!exports.hasProp(studios, arrayProp)) {
            $logger.verbose(`Missing "args.studios.${arrayProp}", setting to default: "${DEFAULT_STUDIO_SETTINGS[arrayProp]}"`);
            studios[arrayProp] = DEFAULT_STUDIO_SETTINGS[arrayProp];
        }
        else if (!Array.isArray(arr) || !arr.every((prop) => typeof prop === "string")) {
            return $throw(`"args.studios.${arrayProp}" does not only contain strings, cannot run plugin"`);
        }
    });
    return validatedArgs;
};
exports.validateArgs = validateArgs;
function lowercase(str) {
    return str.toLowerCase();
}
const normalizeStudioName = (ctx, name) => {
    return name
        .replace(ctx.args.studios.channelSuffix, "")
        .replace(ctx.args.studios.networkSuffix, "");
};
exports.normalizeStudioName = normalizeStudioName;
const getEntityPreferenceFromName = (ctx, name) => {
    let entityPreference = "none";
    if (ctx.args.studios.channelSuffix && name.endsWith(ctx.args.studios.channelSuffix)) {
        entityPreference = "channel";
    }
    else if (ctx.args.studios.networkSuffix && name.endsWith(ctx.args.studios.networkSuffix)) {
        entityPreference = "network";
    }
    return entityPreference;
};
exports.getEntityPreferenceFromName = getEntityPreferenceFromName;
const stripAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
exports.stripAccents = stripAccents;
const slugify = (str) => {
    let res = str.replace(/\s/g, "");
    res = exports.stripAccents(res);
    res = lowercase(res);
    return res;
};
exports.slugify = slugify;
const isBlacklisted = (ctx, prop) => {
    if (ctx.args.studios.whitelist.length) {
        return !ctx.args.studios.whitelist.includes(lowercase(prop));
    }
    return ctx.args.studios.blacklist.includes(lowercase(prop));
};
exports.isBlacklisted = isBlacklisted;
const propExistsInData = ({ data }, prop) => {
    if (!exports.hasProp(data, prop)) {
        return false;
    }
    if (data[prop] === undefined ||
        data[prop] === null ||
        (typeof data[prop] === "string" && data[prop].trim() === "") ||
        (Array.isArray(data[prop]) && data[prop].length === 0)) {
        return false;
    }
    return true;
};
exports.propExistsInData = propExistsInData;
const isOverrideBlacklisted = (ctx, prop) => {
    if (!exports.propExistsInData(ctx, prop)) {
        return false;
    }
    if (ctx.args.studios.whitelistOverride.length) {
        return !ctx.args.studios.whitelistOverride.includes(lowercase(prop));
    }
    return ctx.args.studios.blacklistOverride.includes(lowercase(prop));
};
exports.isOverrideBlacklisted = isOverrideBlacklisted;
const suppressProp = (ctx, prop) => {
    return exports.isBlacklisted(ctx, prop) || exports.isOverrideBlacklisted(ctx, prop);
};
exports.suppressProp = suppressProp;
});

var studio = createCommonjsModule(function (module, exports) {
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
exports.ChannelExtractor = void 0;


class ChannelExtractor {
    constructor(ctx, { channel, network, entityPreference, }) {
        this.ctx = ctx;
        this.api = new api.Api(ctx);
        this.channel = channel;
        this.network = network;
        this.entityPreference = entityPreference;
        this.preferredEntity = this.getPreferredEntity();
    }
    getPreferredEntity() {
        const bothExist = !!this.channel && !!this.network;
        if (this.entityPreference === "channel" ||
            (this.entityPreference === "none" &&
                (!this.network || (bothExist && this.ctx.args.studios.channelPriority)))) {
            return { type: "channel", entity: this.channel };
        }
        if (this.entityPreference === "network" ||
            (this.entityPreference === "none" &&
                (!this.channel || (bothExist && !this.ctx.args.studios.channelPriority)))) {
            return { type: "network", entity: this.network };
        }
        return undefined;
    }
    _getName() {
        var _a, _b, _c, _d, _e, _f;
        const baseName = (_b = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.name;
        if (!baseName) {
            return {};
        }
        const ignoreNameConflicts = ((_c = this.channel) === null || _c === void 0 ? void 0 : _c.name) !== ((_d = this.network) === null || _d === void 0 ? void 0 : _d.name) ||
            (!this.ctx.args.studios.uniqueNames && this.entityPreference === "none");
        if (ignoreNameConflicts) {
            return { name: baseName };
        }
        let suffix = "";
        if (((_e = this.preferredEntity) === null || _e === void 0 ? void 0 : _e.type) === "channel") {
            suffix = this.ctx.args.studios.channelSuffix;
        }
        else if (((_f = this.preferredEntity) === null || _f === void 0 ? void 0 : _f.type) === "network") {
            suffix = this.ctx.args.studios.networkSuffix;
        }
        return { name: `${baseName}${suffix}` };
    }
    getName() {
        if (util.suppressProp(this.ctx, "name")) {
            return {};
        }
        return this._getName();
    }
    getDescription() {
        var _a, _b;
        if (util.suppressProp(this.ctx, "description")) {
            return {};
        }
        const description = (_b = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.description;
        if (!description) {
            return {};
        }
        return { description };
    }
    getThumbnail() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (util.suppressProp(this.ctx, "thumbnail")) {
                return {};
            }
            const entity = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity;
            if (!entity) {
                return {};
            }
            const { logo } = api.buildImageUrls(entity);
            if (!logo) {
                return {};
            }
            const thumbnail = this.ctx.args.dry
                ? `_would_have_created_${logo}`
                : yield this.ctx.$createImage(logo, this._getName().name || this.ctx.studioName, true);
            return {
                thumbnail,
            };
        });
    }
    getAliases() {
        var _a, _b;
        if (util.suppressProp(this.ctx, "aliases")) {
            return {};
        }
        const ourAliases = ((_b = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.aliases) || [];
        if (!ourAliases.length) {
            return {};
        }
        const previousAliases = this.ctx.data.aliases;
        if ((previousAliases === null || previousAliases === void 0 ? void 0 : previousAliases.length) && this.ctx.args.studios.mergeAliases) {
            return {
                aliases: [...previousAliases, ...ourAliases],
            };
        }
        return {
            aliases: ourAliases,
        };
    }
    getParent() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            if (util.suppressProp(this.ctx, "parent")) {
                return {};
            }
            const parentName = (_c = (_b = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.name;
            if (!parentName) {
                return {};
            }
            if (((_e = (_d = this.preferredEntity) === null || _d === void 0 ? void 0 : _d.entity) === null || _e === void 0 ? void 0 : _e.name) === parentName) {
                if (this.ctx.args.studios.uniqueNames) {
                    return { parent: `${parentName}${this.ctx.args.studios.networkSuffix}` };
                }
                this.ctx.$logger.warn(`Cannot return parent name, would conflict with current name`);
                return {};
            }
            const parentSlug = (_h = (_g = (_f = this.preferredEntity) === null || _f === void 0 ? void 0 : _f.entity) === null || _g === void 0 ? void 0 : _g.parent) === null || _h === void 0 ? void 0 : _h.slug;
            if (!parentSlug) {
                this.ctx.$logger.warn(`Parent did not have slug, cannot check for name conflict, will not return parent'`);
                return {};
            }
            const { channel: parentAsChannel, network: parentAsNetwork } = yield this.api.getAllEntities(parentSlug);
            if ((parentAsChannel === null || parentAsChannel === void 0 ? void 0 : parentAsChannel.name) === (parentAsNetwork === null || parentAsNetwork === void 0 ? void 0 : parentAsNetwork.name)) {
                if (this.ctx.args.studios.uniqueNames) {
                    return { parent: `${parentName}${this.ctx.args.studios.networkSuffix}` };
                }
                this.ctx.$logger.warn(`Cannot return parent name, would conflict other parent's other type'`);
                return {};
            }
            return { parent: parentName };
        });
    }
    getCustom() {
        var _a, _b, _c, _d, _e, _f;
        return {
            "Traxxx Slug": (_b = (_a = this.preferredEntity) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.slug,
            "Traxxx Type": (_d = (_c = this.preferredEntity) === null || _c === void 0 ? void 0 : _c.entity) === null || _d === void 0 ? void 0 : _d.type,
            Homepage: (_f = (_e = this.preferredEntity) === null || _e === void 0 ? void 0 : _e.entity) === null || _f === void 0 ? void 0 : _f.url,
        };
    }
}
exports.ChannelExtractor = ChannelExtractor;
exports.default = (initialContext) => __awaiter(void 0, void 0, void 0, function* () {
    const { $logger, $formatMessage, $throw, studioName } = initialContext;
    try {
        const validatedArgs = util.validateArgs(initialContext);
        if (validatedArgs) {
            initialContext.args = validatedArgs;
        }
    }
    catch (err) {
        $throw(err);
        return {};
    }
    const ctx = initialContext;
    const args = ctx.args;
    const api$1 = new api.Api(ctx);
    const entityPreference = util.getEntityPreferenceFromName(ctx, studioName);
    const slugifiedName = util.slugify(util.normalizeStudioName(ctx, studioName));
    ctx.$logger.verbose(`Trying to match "${studioName}" as "${slugifiedName}"`);
    if (entityPreference !== "none") {
        ctx.$logger.verbose(`Identified as ${entityPreference} from current name`);
    }
    const { channel, network } = yield api$1.getAllEntities(slugifiedName);
    if (!channel && !network) {
        $logger.warn(`Could not find channel or network "${studioName}" in TRAXXX`);
        return {};
    }
    const channelExtractor = new ChannelExtractor(ctx, {
        channel,
        network,
        entityPreference,
    });
    const result = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, channelExtractor.getName()), channelExtractor.getDescription()), (yield channelExtractor.getThumbnail())), channelExtractor.getAliases()), (yield channelExtractor.getParent())), { custom: channelExtractor.getCustom() });
    if (args.dry) {
        $logger.info(`Is 'dry' mode, would've returned: ${$formatMessage(result)}`);
        return {};
    }
    return result;
});
});

var name = "traxxx";
var version = "0.2.0";
var authors = [
	"leadwolf"
];
var description = "Scrape data from traxxx";
var events = [
	"studioCreated",
	"studioCustom"
];
var require$$1 = {
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
		name: "studios",
		type: "Object",
		required: false,
		"default": {
		},
		description: "Configuration for studio events"
	},
	{
		name: "studios.channelPriority",
		type: "Boolean",
		required: false,
		"default": true,
		description: "When the studio type is unknown, and the name corresponds to both a channel & a network, whether to prefer the channel or the network"
	},
	{
		name: "studios.uniqueNames",
		type: "Boolean",
		required: false,
		"default": true,
		description: "When the studio name corresponds to both a channel & a network, whether to append suffixes to the name to avoid conflicts. The suffixes obviously cannot be the same. If the studio name already has a suffix, it will be kept, even if this setting is false"
	},
	{
		name: "studios.channelSuffix",
		type: "String",
		required: false,
		"default": "",
		description: "When `studios.uniqueNames` is active and returning a **channel** name that also corresponds to a network, will be appended to the name. WARNING: spaces between the name & suffix will not be automatically added"
	},
	{
		name: "studios.networkSuffix",
		type: "String",
		required: false,
		"default": " (Network)",
		description: "When `studios.uniqueNames` is active and returning a **network** name that also corresponds to a channel, will be appended to the name. WARNING: spaces between the name & suffix will not be automatically added"
	},
	{
		name: "studios.mergeAliases",
		type: "Boolean",
		required: false,
		"default": true,
		description: "When the previous plugin returned aliases, if our plugins aliases should be merged with them or override them"
	},
	{
		name: "studios.whitelist",
		type: "String[]",
		required: false,
		"default": [
		],
		description: "Array of data fields to pick. When non empty, only the fields listed will be returned. Possible values: [`'name', 'description', 'thumbnail', 'aliases', 'parent'`]."
	},
	{
		name: "studios.blacklist",
		type: "String[]",
		required: false,
		"default": [
		],
		description: "Array of data fields to omit. Used **only** when `whitelist` is empty. When non empty, only the fields **not** listed will be returned. (for values see `whitelist`)"
	},
	{
		name: "studios.whitelistOverride",
		type: "String[]",
		required: false,
		"default": [
		],
		description: "Array of data fields to pick, when values already exist from a piped plugin. Acts exactly the same as `whitelist`, but used **only** when the field has been returned by a previous plugin. (**WARNING**: not the same thing as existing values of the scene) (for values see `whitelist`)"
	},
	{
		name: "studios.blacklistOverride",
		type: "String[]",
		required: false,
		"default": [
		],
		description: "Array of data fields to omit, when values already exist from a a piped plugin. Acts exactly the same as `blacklist`, but used **only** when the field has been returned by a previous plugin.  (**WARNING**: not the same thing as existing values of the scene) (for values see `whitelist`)"
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


const studio_1 = __importDefault(studio);
const info_json_1 = __importDefault(require$$1);
const handler = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.args || typeof ctx.args !== "object") {
        ctx.$throw(`Missing args, cannot run plugin`);
        return {};
    }
    if (ctx.event === "studioCreated" || ctx.event === "studioCustom") {
        return studio_1.default(ctx);
    }
    ctx.$throw("Uh oh. You shouldn't use the plugin for this type of event");
    return {};
});
handler.requiredVersion = ">=0.27.0";
plugin.applyMetadata(handler, info_json_1.default);
var main = handler;
var _default = handler;
main.default = _default;

module.exports = _default;
