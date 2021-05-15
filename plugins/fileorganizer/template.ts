import { Actor } from "../../types/actor";
import { Label } from "../../types/label";
import { Movie } from "../../types/movie";
import { MySceneContext } from "./main";

const FIELD_NAME = "name";
const FIELD_RELEASE_DATE = "releaseDate";
const FIELD_RATING = "rating";
const FIELD_VIDEO_HEIGHT = "videoHeight";
const FIELD_VIDEO_WIDTH = "videoWidth";
const FIELD_VIDEO_DURATION = "videoDuration";
const FIELD_ACTORS = "actors";
const FIELD_STUDIO = "studio";
const FIELD_MOVIES = "movies";
const FIELD_LABELS = "labels";

interface IFieldArgs {
  isValid: boolean;
  isMandatory?: boolean;
  index?: number;
}

interface ITemplateFieldResolver {
  name: string;
  getPluginData?(index?: number): Promise<string | undefined>;
  getInitialData(index?: number): Promise<string | undefined>;
}

// To avoid side effects, only some of the initial scene data can be used on createScene event (most are empty anyway and the name is not safe to use)
const safeInitialDataForSceneCreate: string[] = ["videoDuration", "videoWidth", "videoHeight"];

/**
 * Regex to parse templates into blocks with prefix, field and suffix for each block
 *
 * @returns the RegExp
 */
export function getTemplateMatcher(): RegExp {
  return /{(?<prefix>[^{}<]*)<(?<field>[^\d\s\W(>]*)(?<args>[\d\W]*|(?:\([^){}]*\))*)>(?<suffix>[^{}]*)}/g;
}

/**
 * List of all fields allowed within a template and the functions to retrieve their string value
 *
 * @param ctx
 * @returns the resolver for each field
 */
export function getTemplateFieldsResolvers(ctx: MySceneContext): ITemplateFieldResolver[] {
  const { args, scene, data, $moment } = ctx;
  const HAS_NAME_PROP = true;
  const NO_NAME_PROP = false;

  return [
    {
      name: FIELD_NAME,
      getPluginData: async (i?: number) => data.name,
      getInitialData: async (i?: number) => scene.name,
    },
    {
      name: FIELD_RELEASE_DATE,
      getPluginData: async (i?: number) =>
        data.releaseDate ? $moment(data.releaseDate).format(args.dateFormat) : undefined,
      getInitialData: async (i?: number) =>
        scene.releaseDate ? $moment(scene.releaseDate).format(args.dateFormat) : undefined,
    },
    {
      name: FIELD_RATING,
      getPluginData: async (i?: number) => data.rating?.toString(),
      getInitialData: async (i?: number) => scene.rating?.toString(),
    },
    {
      name: FIELD_VIDEO_HEIGHT,
      getInitialData: async (i?: number) => scene.meta?.dimensions?.height?.toString(),
    },
    {
      name: FIELD_VIDEO_WIDTH,
      getInitialData: async (i?: number) => scene.meta?.dimensions?.width?.toString(),
    },
    {
      name: FIELD_VIDEO_DURATION,
      getInitialData: async (i?: number) => formatVideoDuration($moment, scene.meta?.duration),
    },
    {
      name: FIELD_ACTORS,
      getPluginData: async (i?: number) => {
        const actors: string[] | undefined = data.actors;
        return arrayToString(ctx, actors, i, NO_NAME_PROP);
      },
      getInitialData: async (i?: number) => {
        const actors: Actor[] = await ctx.$getActors();
        return arrayToString(ctx, actors, i, HAS_NAME_PROP);
      },
    },
    {
      name: FIELD_STUDIO,
      getPluginData: async (i?: number) => data.studio,
      getInitialData: async (i?: number) => {
        return (await ctx.$getStudio())?.name;
      },
    },
    {
      name: FIELD_LABELS,
      getPluginData: async (i?: number) => {
        const labels: string[] | undefined = data.labels;
        return arrayToString(ctx, labels, i, NO_NAME_PROP);
      },
      getInitialData: async (i?: number) => {
        const labels: Label[] = await ctx.$getLabels();
        return arrayToString(ctx, labels, i, HAS_NAME_PROP);
      },
    },
    {
      name: FIELD_MOVIES,
      getPluginData: async (i?: number) => data.movie,
      getInitialData: async (i?: number) => {
        const movies: Movie[] = await ctx.$getMovies();
        return arrayToString(ctx, movies, i, HAS_NAME_PROP);
      },
    },
  ];
}

/**
 * Validates and extracts the different components of a field argument
 *
 * @param args the field argument to process
 * @returns IFieldArgs corresponding to the args
 */
export function getAndValidateFieldArgs(args: string | undefined): IFieldArgs {
  if (!args) {
    return { isValid: true, isMandatory: false };
  }

  let isValid: boolean = false;
  let isMandatory: boolean = false;
  let index: number | undefined;

  const matches = args.matchAll(/^(?<index>\d{0,2})(?<mandatory>!?)$/gm);
  for (const match of matches) {
    if (match.groups?.index) index = parseInt(match.groups?.index) - 1;
    if (match.groups?.mandatory) isMandatory = true;
    isValid = true;
  }

  return { isValid, isMandatory, index };
}

/**
 * Use the resolver's functions to get the value of a given field
 *
 * @param ctx
 * @param resolver
 * @param index optional. If absent and the field is an array, the full array is used.
 * @returns the field's value
 */
export async function getTemplateFieldValue(
  ctx: MySceneContext,
  resolver: ITemplateFieldResolver,
  index?: number
): Promise<string | undefined> {
  let fieldValue: string | undefined;

  // By default: use piped data from latest plugin...
  if (resolver.getPluginData) {
    fieldValue = await resolver.getPluginData(index);
  }

  // ...and complete the missing piped data with the initial scene data
  if (
    ctx.event === "sceneCustom" ||
    (ctx.event === "sceneCreated" && safeInitialDataForSceneCreate.includes(resolver.name))
  ) {
    fieldValue ??= await resolver.getInitialData(index);
  }

  return fieldValue;
}

/**
 * For fields that have an array value, converts the array to a string (either the requested index or the joined full array)
 *
 * @param ctx
 * @param array
 * @param index
 * @param hasNameProperty indicates wether the array is an array of strings (false) or if the strings have to be taken from the array object's name property
 * @returns
 */
function arrayToString(
  ctx: MySceneContext,
  array: Actor[] | Movie[] | Label[] | string[] | undefined,
  index: number | undefined,
  hasNameProperty: boolean
): string | undefined {
  if (!array || !array.length) {
    return;
  }

  const i: number = index || -1;
  const a: string[] = hasNameProperty ? array.map((a) => a.name) : array;

  // Returns the full array if no specific index is requested
  if (i < 0) {
    return a.join(ctx.args.multiValuesSeparator);
  }

  if (i >= a.length) {
    ctx.$logger.verbose(
      `The field <${(typeof a).toLowerCase()}${
        i + 1
      }> from template is out of bounds (total items: ${a.length})`
    );
    return;
  }

  // Returns the requested index
  return a[i];
}

/**
 * Formats the video duration into a string
 *
 * @param $moment
 * @param duration
 * @returns the formatted duration
 */
function formatVideoDuration($moment, duration): string | undefined {
  if (duration) {
    return $moment()
      .startOf("day")
      .seconds(duration)
      .format(duration < 3600 ? "mm∶ss" : "H∶mm∶ss");
    // What looks like a colon above is actually the mathematical "ratio" character that is allowed in filenames.
  }
}
