import { Context } from "../../types/plugin";
import { IFileParserConfig, MySceneContext } from "./types";

const configFilename = "parserconfig";

const configYAMLFilename = `${configFilename}.yaml`;
const configJSONFilename = `${configFilename}.json`;

export async function findAndLoadSceneConfig(
  ctx: MySceneContext
): Promise<IFileParserConfig | undefined> {
  const { $fs, $logger, $path, scenePath, $yaml } = ctx;
  const configFile = findConfig(ctx, $path.dirname(scenePath));

  if (configFile) {
    $logger.info(`Parsing scene '${scenePath}' using config '${configFile}'`);

    let loadedConfig: IFileParserConfig;
    try {
      if ($path.extname(configFile).toLowerCase() === ".yaml") {
        loadedConfig = $yaml.parse($fs.readFileSync(configFile, "utf-8")) as IFileParserConfig;
      } else {
        loadedConfig = JSON.parse($fs.readFileSync(configFile, "utf-8")) as IFileParserConfig;
      }
    } catch (error) {
      $logger.warn(
        `Invalid config schema. Unable to parse "${configFile}". Double check your config and retry.`
      );
      $logger.error(error);
      return;
    }

    const validationError = isValidConfig(ctx, loadedConfig);
    if (validationError !== true) {
      $logger.warn(
        `Invalid config schema. Unable to validate content near "${validationError.location}". Double check your config and retry.`
      );
      $logger.error(validationError.error.message);
      return;
    }
    return loadedConfig;
  }
}

// Lookikng for a config file, starting from dirPath and going up the parents chain until the base library path is reached.
const findConfig = (ctx: Context, dirName: string): string | undefined => {
  const { $fs, $library, $logger, $path } = ctx;

  try {
    const configFileYAML = $path.format({ dir: dirName, base: configYAMLFilename });
    if ($fs.existsSync(configFileYAML)) {
      $logger.verbose(`Config file found: ${configFileYAML}`);
      return configFileYAML;
    }

    const configFileJSON = $path.format({ dir: dirName, base: configJSONFilename });
    if ($fs.existsSync(configFileJSON)) {
      $logger.verbose(`Config file found: ${configFileJSON}`);
      return configFileJSON;
    }

    if (dirName === $library || dirName === $path.parse(dirName).root) {
      $logger.verbose(`Could not find a config file in the library.`);
      return;
    } else {
      // Config file not yet found => continues looking in parent dir
      const parentDir = $path.resolve(dirName, "..");
      return findConfig(ctx, parentDir);
    }
  } catch (error) {
    $logger.error(`Error finding config file: ${error}. Stopped looking.`);
  }
};

export function isValidConfig(
  ctx: Context,
  val: unknown
): true | { location: string; error: Error } {
  const { $zod } = ctx;
  let generalError: Error | null = null;
  const location: string = "root";

  const fileReplaceSchemaElem = $zod
    .array($zod.object({ original: $zod.string(), replacement: $zod.string() }))
    .optional();

  const fileParserSchemaElem = $zod.object({
    scopeDirname: $zod.boolean().optional(),
    regex: $zod.string(),
    matchesToUse: $zod.array($zod.number()).optional(),
    groupsToUse: $zod.array($zod.number()).optional(),
    splitter: $zod.string().optional(),
  });

  const configSchema = $zod.object({
    characterReplacement: fileReplaceSchemaElem.optional(),
    studioMatcher: fileParserSchemaElem.optional(),
    nameMatcher: fileParserSchemaElem.optional(),
    actorsMatcher: fileParserSchemaElem.optional(),
    movieMatcher: fileParserSchemaElem.optional(),
    labelsMatcher: fileParserSchemaElem.optional(),
  });

  try {
    configSchema.parse(val);
  } catch (err) {
    generalError = err as Error;
  }

  return generalError ? { location: location, error: generalError } : true;
}
