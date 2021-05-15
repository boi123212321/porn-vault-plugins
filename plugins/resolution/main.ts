import { applyMetadata, Plugin } from "../../types/plugin";
import { SceneContext } from "../../types/scene";

import info from "./info.json";

interface MyContext {
  args: {
    resolutions?: unknown;
  };
}

const handler: Plugin<SceneContext & MyContext, any> = async (ctx) => {
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
};

handler.requiredVersion = ">=0.27.0";

applyMetadata(handler, info);

module.exports = handler;

export default handler;
