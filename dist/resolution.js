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

var name = "resolution";
var version = "0.1.0";
var authors = [
	"boi123212321"
];
var description = "Add resolution labels to a scene";
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
		name: "resolutions",
		type: "number[]",
		required: false,
		"default": [
		],
		description: "Resolutions to match against the scene's path, when the scene's metadata has not yet been extracted"
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
    const { args, $throw, data, scenePath, scene } = ctx;
    if (!scenePath) {
        return $throw("Uh oh. You shouldn't use the plugin for this type of event");
    }
    let resolutions = [144, 240, 360, 480, 720, 1080, 2160];
    if (args.resolutions) {
        if (!Array.isArray(args.resolutions) || args.resolutions.some((x) => isNaN(parseInt(x)))) {
            return $throw("Invalid resolutions array");
        }
        resolutions = args.resolutions.map((x) => parseInt(x));
    }
    if (scene.meta.dimensions && scene.meta.dimensions.height) {
        const formattedResolution = `${scene.meta.dimensions.height}p`;
        if (data.labels) {
            return {
                labels: [...data.labels, formattedResolution],
            };
        }
        return {
            labels: [formattedResolution],
        };
    }
    const resolution = resolutions.find((res) => scenePath.toLowerCase().includes(`${res}p`));
    if (resolution) {
        const formattedResolution = `${resolution}p`;
        if (data.labels) {
            return {
                labels: [...data.labels, formattedResolution],
            };
        }
        return {
            labels: [formattedResolution],
        };
    }
    return {};
});
handler.requiredVersion = ">=0.27.0";
plugin.applyMetadata(handler, info_json_1.default);
var main = handler;
var _default = handler;
main.default = _default;

module.exports = _default;
