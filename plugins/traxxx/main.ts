import { applyMetadata, Plugin } from "../../types/plugin";
import { StudioOutput } from "../../types/studio";

import studioHandler from "./studio";
import { MyStudioContext } from "./types";

import info from "./info.json";

const handler: Plugin<MyStudioContext, StudioOutput> = async (ctx) => {
  if (!ctx.args || typeof ctx.args !== "object") {
    ctx.$throw(`Missing args, cannot run plugin`);
    return {};
  }

  if (ctx.event === "studioCreated" || ctx.event === "studioCustom") {
    return studioHandler(ctx);
  }

  ctx.$throw("Uh oh. You shouldn't use the plugin for this type of event");
  return {};
};

handler.requiredVersion = ">=0.27.0";

applyMetadata(handler, info);

module.exports = handler;

export default handler;
