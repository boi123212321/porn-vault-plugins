import { Context } from "../../types/plugin";
import { IFileParserConfigElem, IReplacementCharacter, MySceneContext } from "./types";

// Parses the input to find a date. The date separator can be ".", " ", "-", "_" or "/".
export const dateToTimestamp = (ctx: Context, textToParse: string): number | undefined => {
  const { $logger, $moment } = ctx;

  if (!textToParse || textToParse === "") return;

  $logger.debug(`Attempting a date match in: ${textToParse}`);

  // '_' replacement are needed for proper boundaries detection by the regex
  const dateStr = textToParse.replace(/_/g, "-");

  const yyyymmdd = /(\b(?:19|20)\d\d)[- /.](\b1[012]|0[1-9])[- /.](\b3[01]|[12]\d|0[1-9])/.exec(
    dateStr
  );
  const ddmmyyyy = /(\b3[01]|[12]\d|0[1-9])[- /.](\b1[012]|0[1-9])[- /.](\b(?:19|20)\d\d)/.exec(
    dateStr
  );
  const yymmdd = /(\b\d\d)[- /.](\b1[012]|0[1-9])[- /.](\b3[01]|[12]\d|0[1-9])/.exec(dateStr);
  const ddmmyy = /(\b3[01]|[12]\d|0[1-9])[- /.](\b1[012]|0[1-9])[- /.](\b\d\d)/.exec(dateStr);
  const yyyymm = /\b((?:19|20)\d\d)[- /.](\b1[012]|0[1-9])/.exec(dateStr);
  const mmyyyy = /(\b1[012]|0[1-9])[- /.](\b(?:19|20)\d\d)/.exec(dateStr);
  const yyyy = /(\b(?:19|20)\d\d)/.exec(dateStr);

  if (yyyymmdd && yyyymmdd.length) {
    const date = yyyymmdd[0].replace(/[- /.]/g, "-");

    $logger.debug("\tSUCCESS: Found => yyyymmdd");

    return $moment(date, "YYYY-MM-DD").valueOf();
  }
  if (ddmmyyyy && ddmmyyyy.length) {
    const date = ddmmyyyy[0].replace(/[- /.]/g, "-");

    $logger.debug("\tSUCCESS: Found => ddmmyyyy");

    return $moment(date, "DD-MM-YYYY").valueOf();
  }
  if (yymmdd && yymmdd.length) {
    const date = yymmdd[0].replace(/[- /.]/g, "-");

    $logger.debug("\tSUCCESS: Found => yymmdd");

    return $moment(date, "YY-MM-DD").valueOf();
  }
  if (ddmmyy && ddmmyy.length) {
    const date = ddmmyy[0].replace(/[- /.]/g, "-");

    $logger.debug("\tSUCCESS: Found => ddmmyy");

    return $moment(date, "DD-MM-YY").valueOf();
  }
  if (yyyymm && yyyymm.length) {
    const date = yyyymm[0].replace(/[- /.]/g, "-");

    $logger.debug("\tSUCCESS: Found => yyyymm");

    return $moment(date, "YYYY-MM").valueOf();
  }
  if (mmyyyy && mmyyyy.length) {
    const date = mmyyyy[0].replace(/[- /.]/g, "-");

    $logger.debug("\tSUCCESS: Found => mmyyyy");

    return $moment(date, "MM-YYYY").valueOf();
  }
  if (yyyy && yyyy.length) {
    const date = yyyy[0];

    $logger.debug("\tSUCCESS: Found => yyyy");

    return $moment(date, "YYYY").valueOf();
  }

  $logger.debug("\tFAILED: Could not find a date");
};

export function matchElement(
  ctx: MySceneContext,
  matcher: IFileParserConfigElem,
  characterReplacement?: IReplacementCharacter[]
): string[] | undefined {
  const { $logger, $path, scenePath } = ctx;

  if (!matcher) return;

  const toMatch = matcher.scopeDirname ? $path.dirname(scenePath) : $path.parse(scenePath).name;
  const regex = new RegExp(matcher.regex, "gm");
  const matchesIterable = toMatch.matchAll(regex);
  const matchedResult: string[] = [];

  if (!matchesIterable) {
    $logger.info(
      `No matches in ${toMatch} with regex /${regex}/. Check your config to make sure it matches your files.`
    );
    return;
  }

  const matches = Array.from(matchesIterable);
  // default match is "1st match only"
  const matchesToUse: number[] = matcher.matchesToUse ?? [1];
  // default group is "2nd group only" (1st group is usually a "full match")
  const groupsToUse: number[] = matcher.groupsToUse ?? [2];
  // Presence of 0 means "all matches"
  const useAllMatches: boolean = matchesToUse.includes(0);
  const useAllGroups: boolean = groupsToUse.includes(0);

  matches.forEach((match, i) => {
    if (!useAllMatches && !matchesToUse.includes(i + 1)) {
      $logger.debug(`Skipping match not to be used: [${i + 1}] ${JSON.stringify(match)}`);
      return;
    }

    // Get all groups within a match or filtered according to config
    let groups: string[] = match;
    if (!useAllGroups && groups.length > 1) {
      groups = match.filter((group, j) => groupsToUse.includes(j + 1));
      $logger.debug(`Using group(s) ${groupsToUse}: ${JSON.stringify(groups)}`);
    }

    let text: string = groups.join(" ");
    if (characterReplacement) {
      characterReplacement.forEach((e) => {
        text = text.replace(new RegExp(e.original, "g"), e.replacement);
      });
    }

    matchedResult.push(...getSplitResults(text, matcher.splitter));
  });

  $logger.debug(`Final matched result: "${JSON.stringify(matchedResult)}"`);
  return matchedResult;
}

function getSplitResults(text: string, splitter: string | undefined): string[] {
  if (splitter && splitter !== "") {
    return text.split(splitter).map((s) => s.trim());
  } else {
    return [text.trim()];
  }
}
