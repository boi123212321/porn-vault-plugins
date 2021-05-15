import { applyMetadata, Plugin } from "../../types/plugin";
import { ActorContext, ActorOutput } from "../../types/actor";
import { MovieContext, MovieOutput } from "../../types/movie";

import actorHandler from "./actor";
import movieHandler from "./movie";

import info from "./info.json";

type MyContext = (MovieContext | ActorContext) & { args: { dry?: boolean } };
type MyOutput = ActorOutput | MovieOutput | undefined;

const handler: Plugin<MyContext, MyOutput> = async (ctx) => {
  if ((ctx as MovieContext).movieName) {
    return movieHandler(ctx as MovieContext & { args: any });
  }
  if ((ctx as ActorContext).actorName) {
    return actorHandler(ctx as ActorContext & { args: any });
  }
  ctx.$throw("Uh oh. You shouldn't use the plugin for this type of event");
};

handler.requiredVersion = ">=0.27.0";

applyMetadata(handler, info);

module.exports = handler;

export default handler;
