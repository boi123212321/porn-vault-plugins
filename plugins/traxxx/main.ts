import { ActorOutput } from "../../types/actor";
import { SceneOutput } from "../../types/scene";
import { StudioOutput } from "../../types/studio";

import actorHandler from "./actor";
import sceneHandler from "./scene";
import studioHandler from "./studio";
import { MyActorContext, MyStudioContext, MySceneContext } from "./types";

module.exports = async (
  ctx: MyActorContext | MyStudioContext | MySceneContext
): Promise<ActorOutput | StudioOutput | SceneOutput> => {
  if (!ctx.args || typeof ctx.args !== "object") {
    ctx.$throw(`Missing args, cannot run plugin`);
    return {};
  }
  if (ctx.event === "actorCreated" || ctx.event === "actorCustom") {
    return actorHandler(ctx as MyActorContext);
  }

  if (ctx.event === "sceneCreated" || ctx.event === "sceneCustom") {
    return sceneHandler(ctx as MySceneContext);
  }

  if (ctx.event === "studioCreated" || ctx.event === "studioCustom") {
    return studioHandler(ctx as MyStudioContext);
  }

  ctx.$throw("Uh oh. You shouldn't use the plugin for this type of event");
  return {};
};
