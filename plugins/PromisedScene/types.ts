/* eslint-disable camelcase */
import { SceneContext } from "../../types/scene";

export namespace SceneResult {
  export interface Poster {
    large: string;
    medium: string;
    small: string;
  }

  export interface Background {
    full: string;
    large: string;
    medium: string;
    small: string;
  }

  export interface Media {
    id: number;
    url: string;
    size: number;
    order: number;
  }

  export type Extra = Partial<{
    gender: string;
    birthday: string;
    iafd: any;
    astrology: any;
    birthplace: string;
    ethnicity: string;
    nationality: any;
    haircolor: string;
    height: string;
    weight: string;
    measurements: string;
    tattoos: any;
    piercings: any;
    yearsactive: any;
    cupsize: string;
    fakeboobs: boolean;
    status: any;
    birthday_timestamp: number;
    birthplace_code: string;
    active: number;
    hair_colour: string;
    first_seen: Date;
    waist: string;
    hips: string;
  }>;

  export type External = Partial<{
    iafd_url: string;
    babeopedia_id: string;
    freeones_id: string;
    indexxx_id: string;
  }>;

  export interface ParentPoster {
    id: number;
    url: string;
    size: number;
    order: number;
  }

  export interface Parent {
    id: string;
    _id: number;
    slug: string;
    name: string;
    bio: string;
    is_parent: boolean;
    extras: Extra;
    external: External;
    image: string;
    thumbnail: string;
    posters: ParentPoster[];
  }

  export interface Site {
    id: number;
    parent_id: number;
    network_id: number;
    name: string;
    short_name: string;
    url: string;
    logo: string;
    favicon: string;
    poster: string;
  }

  export interface ParentPerformer {
    id: string;
    _id: number;
    site_id: number;
    slug?: any;
    name: string;
    bio: string;
    is_parent: boolean;
    extra: Extra;
    image: string;
    thumbnail: string;
    parent: Parent;
  }

  export interface Tag {
    id: number;
    tag: string;
    name: string;
  }

  export interface Performer {
    id: string;
    _id: number;
    site_id: number;
    slug?: any;
    name: string;
    bio: string;
    is_parent: boolean;
    extra: Extra;
    image: string;
    thumbnail: string;
    parent: ParentPerformer;
  }

  export interface SceneData {
    id: string;
    _id: number;
    title: string;
    slug: string;
    external_id: string;
    description: string;
    site_id: number;
    date: string;
    url: string;
    image: string;
    poster: string;
    trailer: string;
    posters: Poster;
    background: Background;
    media: Media;
    created: string;
    last_updated: string;
    performers: Performer[];
    site: Site;
    hashes: string[];
    tags: Tag[];
  }

  export interface Links {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  }

  export interface Link {
    url: string;
    label: string;
    active: boolean;
  }

  export interface Meta {
    current_page: number;
    from: number;
    last_page: number;
    links: Link[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  }

  export type SlimSceneData = Omit<SceneData, "tags">;

  export interface SceneListResult {
    data: SlimSceneData[];
    links: Links;
    meta: Meta;
  }

  export interface SingleSceneResult {
    data: SceneData;
  }
}

export namespace SiteResult {
  export interface Data {
    id: number;
    name: string;
    short_name: string;
    url: string;
    logo: string;
    favicon: string;
  }

  export interface SiteListResult {
    data: Data[];
  }
}

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface MyContext extends SceneContext {
  args: DeepPartial<{
    apiKey: string;
    useTitleInSearch: boolean;
    parseActor: boolean;
    parseStudio: boolean;
    parseDate: boolean;
    manualTouch: boolean;
    sceneDuplicationCheck: boolean;
    alwaysUseSingleResult: boolean;
    usePipedInputInSearch: boolean;
    source_settings: {
      actors: string;
      studios: string;
      scenes: string;
    };
  }>;
  testMode: DeepPartial<{
    questionAnswers: {
      enterInfoSearch: string;
      enterMovie: string;
      enterOneActorName: string;
      enterSceneDate: string;
      enterSceneTitle: string;
      enterStudioName: string;
      movieTitle: string;
      manualDescription: string;
      manualActors: string;
      multipleChoice: string;
      extra: string;
    };
    correctImportInfo: string;
    testSiteUnavailable: boolean;
    status: boolean;
  }>;
}
