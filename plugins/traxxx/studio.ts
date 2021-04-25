import { StudioOutput } from "../../types/studio";
import { Api, buildImageUrls, EntityResult } from "./api";
import { MyStudioContext, MyValidatedStudioContext } from "./types";
import {
  getEntityPreferenceFromName,
  normalizeStudioName,
  EntityPreference,
  slugify,
  suppressProp,
  validateStudioArgs,
} from "./util";

export class ChannelExtractor {
  ctx: MyValidatedStudioContext;
  channel?: EntityResult.Entity;
  network?: EntityResult.Entity;
  entityPreference: EntityPreference;
  api: Api;
  preferredEntity:
    | { type: "channel" | "network"; entity: EntityResult.Entity | undefined }
    | undefined;

  /**
   * @param ctx - plugin context
   * @param input - extractor input
   * @param input.channel - the matched channel
   * @param input.network - the matched network
   * @param input.entityPreference - if should return channel/network, or default: according
   * to user args (when conflict), or whatever is found (no conflict).
   */
  constructor(
    ctx: MyValidatedStudioContext,
    {
      channel,
      network,
      entityPreference,
    }: {
      channel?: EntityResult.Entity;
      network?: EntityResult.Entity;
      entityPreference: EntityPreference;
    }
  ) {
    this.ctx = ctx;
    this.api = new Api(ctx);
    this.channel = channel;
    this.network = network;
    this.entityPreference = entityPreference;
    this.preferredEntity = this.getPreferredEntity();
  }

  private getPreferredEntity():
    | {
        type: "channel" | "network";
        entity: EntityResult.Entity | undefined;
      }
    | undefined {
    const bothExist = !!this.channel && !!this.network;

    if (
      this.entityPreference === "channel" ||
      (this.entityPreference === "none" &&
        (!this.network || (bothExist && this.ctx.args.studios.channelPriority)))
    ) {
      return { type: "channel", entity: this.channel };
    }
    if (
      this.entityPreference === "network" ||
      (this.entityPreference === "none" &&
        (!this.channel || (bothExist && !this.ctx.args.studios.channelPriority)))
    ) {
      return { type: "network", entity: this.network };
    }

    return undefined;
  }

  private _getName(): Partial<{ name: string }> {
    const baseName = this.preferredEntity?.entity?.name;
    if (!baseName) {
      return {};
    }

    const ignoreNameConflicts =
      this.channel?.name !== this.network?.name ||
      (!this.ctx.args.studios.uniqueNames && this.entityPreference === "none");
    // Only use 'uniqueNames' to ignore, when the studio name does not already have a suffix
    if (ignoreNameConflicts) {
      return { name: baseName };
    }

    let suffix: string = "";
    if (this.preferredEntity?.type === "channel") {
      suffix = this.ctx.args.studios.channelSuffix;
    } else if (this.preferredEntity?.type === "network") {
      suffix = this.ctx.args.studios.networkSuffix;
    }

    return { name: `${baseName}${suffix}` };
  }

  public getName(): Partial<{ name: string }> {
    if (suppressProp(this.ctx, "name")) {
      return {};
    }

    return this._getName();
  }

  getDescription(): Partial<{ description: string }> {
    if (suppressProp(this.ctx, "description")) {
      return {};
    }

    const description = this.preferredEntity?.entity?.description;
    if (!description) {
      return {};
    }

    return { description };
  }

  async getThumbnail(): Promise<Partial<{ thumbnail: string }>> {
    if (suppressProp(this.ctx, "thumbnail")) {
      return {};
    }

    const entity = this.preferredEntity?.entity;
    if (!entity) {
      return {};
    }

    const { logo } = buildImageUrls(entity, this.ctx.args);

    if (!logo) {
      return {};
    }

    const thumbnail = this.ctx.args.dry
      ? `_would_have_created_${logo}`
      : await this.ctx.$createImage(logo, this._getName().name || this.ctx.studioName, true);

    return {
      thumbnail,
    };
  }

  getAliases(): Partial<{ aliases: string[] }> {
    if (suppressProp(this.ctx, "aliases")) {
      return {};
    }

    const ourAliases = this.preferredEntity?.entity?.aliases || [];
    if (!ourAliases.length) {
      return {};
    }

    const previousAliases = this.ctx.data.aliases;
    if (previousAliases?.length && this.ctx.args.studios.mergeAliases) {
      return {
        aliases: [...previousAliases, ...ourAliases],
      };
    }

    return {
      aliases: ourAliases,
    };
  }

  async getParent(): Promise<Partial<{ parent: string }>> {
    if (suppressProp(this.ctx, "parent")) {
      return {};
    }

    const parentName = this.preferredEntity?.entity?.parent?.name;
    if (!parentName) {
      return {};
    }

    // If we already know there is a conflict, we can handle it right away
    if (this.preferredEntity?.entity?.name === parentName) {
      if (this.ctx.args.studios.uniqueNames) {
        return { parent: `${parentName}${this.ctx.args.studios.networkSuffix}` };
      }
      this.ctx.$logger.warn(`Cannot return parent name, would conflict with current name`);
      return {};
    }

    // Otherwise, we have to check if the parent has a potential name conflict
    const parentSlug = this.preferredEntity?.entity?.parent?.slug;
    if (!parentSlug) {
      this.ctx.$logger.warn(
        `Parent did not have slug, cannot check for name conflict, will not return parent'`
      );
      return {};
    }

    const { channel: parentAsChannel, network: parentAsNetwork } = await this.api.getAllEntities(
      parentSlug
    );

    if (parentAsChannel?.name === parentAsNetwork?.name) {
      if (this.ctx.args.studios.uniqueNames) {
        return { parent: `${parentName}${this.ctx.args.studios.networkSuffix}` };
      }
      this.ctx.$logger.warn(`Cannot return parent name, would conflict other parent's other type'`);
      return {};
    }

    return { parent: parentName };
  }

  getCustom(): Partial<{ "Traxxx Slug": string; "Traxxx Type": string; Homepage: string }> {
    return {
      "Traxxx Slug": this.preferredEntity?.entity?.slug,
      "Traxxx Type": this.preferredEntity?.entity?.type,
      Homepage: this.preferredEntity?.entity?.url,
    };
  }
}

export default async (initialContext: MyStudioContext): Promise<StudioOutput> => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { $logger, $formatMessage, $throw, studioName } = initialContext;

  try {
    const validatedArgs = validateStudioArgs(initialContext);
    if (validatedArgs) {
      initialContext.args = validatedArgs;
    }
  } catch (err) {
    $throw(err);
    return {};
  }

  // Can assert all properties exist, since we just validated them above
  const ctx = initialContext as MyValidatedStudioContext;
  const args = ctx.args;

  const api = new Api(ctx);

  const entityPreference = getEntityPreferenceFromName(ctx, studioName);
  const slugifiedName = slugify(normalizeStudioName(ctx, studioName));

  ctx.$logger.verbose(`Trying to match "${studioName}" as "${slugifiedName}"`);
  if (entityPreference !== "none") {
    ctx.$logger.verbose(`Identified as ${entityPreference} from current name`);
  }

  const { channel, network } = await api.getAllEntities(slugifiedName);

  if (!channel && !network) {
    $logger.warn(`Could not find channel or network "${studioName}" in TRAXXX`);
    return {};
  }

  const channelExtractor = new ChannelExtractor(ctx, {
    channel,
    network,
    entityPreference,
  });

  const result: StudioOutput = {
    ...channelExtractor.getName(),
    ...channelExtractor.getDescription(),
    ...(await channelExtractor.getThumbnail()),
    ...channelExtractor.getAliases(),
    ...(await channelExtractor.getParent()),
    custom: channelExtractor.getCustom(),
  };

  if (args.dry) {
    $logger.info(`Is 'dry' mode, would've returned: ${$formatMessage(result)}`);
    return {};
  }

  return result;
};
