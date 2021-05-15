import { AxiosInstance, AxiosResponse } from "axios";

import { MyContext, SceneResult, SiteResult } from "./types";
import { Context } from "../../types/plugin";

export class Api {
  ctx: Context;
  axios: AxiosInstance;

  constructor(ctx: MyContext) {
    this.ctx = ctx;
    this.axios = ctx.$axios.create({
      baseURL: "https://api.metadataapi.net/api",
      headers: { Authorization: `Bearer ${ctx.args.apiKey}` },
    });
  }

  async parseScene(parse: string): Promise<AxiosResponse<SceneResult.SceneListResult>> {
    this.ctx.$logger.verbose(
      `GET: https://api.metadataapi.net/api/scenes?parse=${encodeURIComponent(parse)}`
    );
    return this.axios.get<SceneResult.SceneListResult>("/scenes", {
      params: {
        parse,
      },
    });
  }

  async getSceneById(sceneId: string): Promise<AxiosResponse<SceneResult.SingleSceneResult>> {
    return this.axios.get<SceneResult.SingleSceneResult>(`/scenes/${sceneId}`);
  }

  async getSites(): Promise<AxiosResponse<SiteResult.SiteListResult>> {
    return this.axios.get<SiteResult.SiteListResult>("/sites");
  }
}
