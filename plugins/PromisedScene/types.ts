import { SceneContext } from "../../types/scene";

export namespace SceneResult {
  export interface Posters {
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

  export interface Extra {
    gender: string;
    birthday: string;
    iafd?: any;
    astrology: string;
    birthplace: string;
    ethnicity: string;
    nationality: string;
    haircolor: string;
    height: string;
    weight: string;
    measurements: string;
    tattoos?: any;
    piercings: string;
    yearsactive?: any;
    cupsize: string;
    fakeboobs: boolean;
    status: string;
  }

  export interface Extras {
    gender: string;
    birthday: string;
    birthday_timestamp?: number;
    birthplace: string;
    birthplace_code: string;
    active?: number;
    astrology: string;
    ethnicity: string;
    nationality: string;
    hair_colour: string;
    weight: string;
    height: string;
    measurements: string;
    cupsize: string;
    tattoos: string;
    piercings: string;
    first_seen: Date;
    waist: string;
    hips: string;
  }

  export interface Poster {
    url: string;
    size: number;
    order: number;
  }

  export interface Parent {
    id: string;
    slug: string;
    name: string;
    bio: string;
    is_parent: boolean;
    extras: Extras;
    aliases: string[];
    image: string;
    thumbnail: string;
    posters: Poster[];
  }

  export interface Site {
    id: number;
    name: string;
    short_name: string;
    url: string;
    logo: string;
    favicon: string;
  }

  export interface Performer {
    id: string;
    slug?: any;
    name: string;
    bio: string;
    is_parent: boolean;
    extra: Extra;
    image: string;
    thumbnail: string;
    parent: Parent;
    site: Site;
  }

  export interface Tag {
    id: number;
    tag: string;
  }

  export interface Movie {
    id: string;
    title: string;
    description?: any;
    site_id: number;
    date?: any;
    url?: any;
    created: string;
    last_updated: string;
  }

  export interface SceneData {
    id: string;
    title: string;
    slug: string;
    description: string;
    site_id: number;
    date: string;
    url: string;
    poster: string;
    trailer: string;
    posters: Posters;
    background: Background;
    created: string;
    last_updated: string;
    performers: Performer[];
    site: Site;
    tags: Tag[];
    hashes: any[];
    movie: Movie;
  }

  export interface Links {
    first: string;
    last: string;
    prev?: any;
    next: string;
  }

  export interface Link {
    url: string;
    label: any;
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

  export interface SceneListResult {
    data: SceneData[];
    links: Links;
    meta: Meta;
  }

  export interface SingleSceneResult {
    data: SceneData;
    links: Links;
    meta: Meta;
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
