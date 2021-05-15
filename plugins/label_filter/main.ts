import { applyMetadata, Plugin } from "../../types/plugin";
import { ActorContext } from "../../types/actor";
import { SceneContext } from "../../types/scene";
import { StudioContext } from "../../types/studio";

import info from "./info.json";

interface MyContext {
  args: {
    whitelist?: string[];
    blacklist?: string[];
  };
}

const lower = (s: string): string => s.toLowerCase();

const handler: Plugin<
  (ActorContext | SceneContext | StudioContext) & MyContext,
  { labels?: string[] }
> = async ({ args, data }) => {
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
};

handler.requiredVersion = ">=0.27.0";

applyMetadata(handler, info);

module.exports = handler;

export default handler;
