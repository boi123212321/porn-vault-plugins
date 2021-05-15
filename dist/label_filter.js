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

var name = "label_filter";
var version = "0.1.0";
var authors = [
	"boi123212321"
];
var description = "Filter labels returned by other plugins";
var events = [
	"actorCreated",
	"actorCustom",
	"sceneCreated",
	"sceneCustom",
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
		name: "whitelist",
		type: "String[]",
		required: false,
		"default": [
		],
		description: "Labels to include"
	},
	{
		name: "blacklist",
		type: "String[]",
		required: false,
		"default": [
		],
		description: "Labels to exclude"
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
const lower = (s) => s.toLowerCase();
const handler = ({ args, data }) => __awaiter(void 0, void 0, void 0, function* () {
    const whitelist = (args.whitelist || []).map(lower);
    const blacklist = (args.blacklist || []).map(lower);
    if (!data.labels) {
        return {};
    }
    if (!whitelist.length && !blacklist.length) {
        return {};
    }
    return {
        labels: data.labels.filter((label) => {
            const lowercased = lower(label);
            if (whitelist.length && !whitelist.includes(label)) {
                return false;
            }
            return blacklist.every((blacklisted) => blacklisted !== lowercased);
        }),
    };
});
handler.requiredVersion = ">=0.27.0";
plugin.applyMetadata(handler, info_json_1.default);
var main = handler;
var _default = handler;
main.default = _default;

module.exports = _default;
