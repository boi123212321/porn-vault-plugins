import { ActorContext } from "../../types/actor";
import { SceneContext } from "../../types/scene";
import { StudioContext } from "../../types/studio";

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface ActorSettings {
  /**
   * Label added if the actor is not found on Traxxx
   */
  missingLabel?: string;
}

export interface SceneSettings {
  /**
   * Label added if the scene is not found on Traxxx
   */
  missingLabel: string;
  /**
   * The current studio must match the studio returned from traxxx. Only works when another plugin resolves the studio.
   */
  matchStudio: boolean;
  /**
   * The current actors must be returned from traxx. Only works when another plugin resolves the studio.
   */
  matchActors: boolean;
  /**
   * The maximum diference between the result and the original value.
   */
  maxLevenshteinDistance: number;
}

export interface ServerSettings {
  /**
   * Override the default URL for use with local instance of traxxx, Default is http://traxx.me.
   */
  URL: string;
  /**
   * Limit the number of results returned from the api. Default is 100
   */
  limit: number;
  /**
   * The local folder that traxx stores the media.
   */
  mediaLocation: string;
}

export interface StudioSettings {
  /**
   * If a studio name is both a channel and a network, whether to use the channel
   * or the network for the data returned. Overridden by 'channelSuffix' & 'networkSuffix'
   */
  channelPriority: boolean;
  /**
   * If a studio name is both a channel and a network, if the returned name
   * should add the have the type as a suffix
   */
  uniqueNames: boolean;
  /**
   * Suffix to add to the studio name, when `channelPriority: true && uniqueNames: true`.
   * When this already exists on the 'studioName', the plugin should only return a channel match.
   * Warning: will not automatically add a space between the name and this suffix
   */
  channelSuffix: string;
  /**
   * Suffix to add to the studio name, when `channelPriority: false && uniqueNames: true`.
   * When this already exists on the 'studioName', the plugin should only return a network match.
   * Warning: will not automatically add a space between the name and this suffix
   */
  networkSuffix: string;
  /**
   * If returning aliases, whether to merge or override the aliases from a previous plugin
   */
  mergeAliases: boolean;
  /**
   * Array of properties to allow returning. If non empty, blacklist will be ignored.
   */
  whitelist: string[];
  /**
   * Array of properties to prevent returning
   */
  blacklist: string[];
  /**
   * Array of properties to allow returning, even if a previous plugin
   * already returned those properties
   */
  whitelistOverride: string[];
  /**
   * Array of properties to prevent returning when the previous plugin
   * already returned those properties
   */
  blacklistOverride: string[];
}

export interface MyActorArgs {
  dry: boolean;
  server: ServerSettings;
  actors: ActorSettings;
}

export interface MyActorContext extends ActorContext {
  args?: DeepPartial<MyActorArgs>;
}

export interface MyValidatedActorContext extends ActorContext {
  args: MyActorArgs;
}

export interface MySceneArgs {
  dry: boolean;
  server: ServerSettings;
  scenes: SceneSettings;
}

export interface MySceneContext extends SceneContext {
  args?: DeepPartial<MySceneArgs>;
}

export interface MyValidatedSceneContext extends SceneContext {
  args: MySceneArgs;
}

export interface MyStudioArgs {
  dry: boolean;
  server: ServerSettings;
  studios: StudioSettings;
}

export interface MyStudioContext extends StudioContext {
  args?: DeepPartial<MyStudioArgs>;
}

export interface MyValidatedStudioContext extends StudioContext {
  args: MyStudioArgs;
}
