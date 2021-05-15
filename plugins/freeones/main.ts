import { applyMetadata, Plugin, Context } from "../../types/plugin";
import { ActorContext, ActorOutput } from "../../types/actor";

import * as $cheerio from "cheerio";

import info from "./info.json";

interface MyContext extends ActorContext {
  args: {
    whitelist?: string[];
    blacklist?: string[];
    dry?: boolean;
    useImperial?: boolean;
    searchResultsSort?: "string";
    useAvatarAsThumbnail?: boolean;
    piercingsType?: "string" | "array";
    tattoosType?: "string" | "array";
  };
}

function lowercase(str: string): string {
  return str.toLowerCase();
}

function cmToFt(cm: number): number {
  cm *= 0.033;
  return Math.round((cm + Number.EPSILON) * 100) / 100;
}

function kgToLbs(kg: number): number {
  kg *= 2.2;
  return Math.round((kg + Number.EPSILON) * 100) / 100;
}

async function search(
  { $axios }: { $axios: Context["$axios"] },
  query: string,
  sort: string
): Promise<string> {
  const url = `https://www.freeones.com/partial/subject`;
  return (
    await $axios.get(url, {
      params: {
        q: query,
        s: sort,
      },
    })
  ).data;
}

async function getFirstSearchResult(ctx: MyContext, query: string): Promise<cheerio.Cheerio> {
  const searchHtml = await search(ctx, query, ctx.args.searchResultsSort || "relevance");
  const $ = $cheerio.load(searchHtml);
  const el = $(".grid-item.teaser-subject>a");
  return el;
}

class Measurements {
  bust?: number;
  cup?: string;
  waist?: number;
  hip?: number;

  static fromString(str): Measurements | null {
    const [bra, waist, hip] = str.split("-");
    if (bra && waist && hip) {
      const measurements = new Measurements();
      measurements.bust = parseInt(bra);
      measurements.cup = bra.replace(measurements.bust, "");
      measurements.waist = Number(waist);
      measurements.hip = Number(hip);
      return measurements;
    }
    return null;
  }

  toString(): string {
    return `${this.braSize()}-${this.waist}-${this.hip}`;
  }

  braSize(): string {
    return `${this.bust}${this.cup}`;
  }
}

const handler: Plugin<MyContext, ActorOutput> = async (ctx) => {
  const { $createImage, args, $axios, $moment, $throw, $logger, $formatMessage, actorName } = ctx;
  if (!actorName) {
    $throw("Uh oh. You shouldn't use the plugin for this type of event");
  }

  $logger.info(`Scraping freeones for ${actorName}, dry mode: ${args.dry || false}...`);

  const blacklist = (args.blacklist || []).map(lowercase);
  if (!args.blacklist) {
    $logger.verbose("No blacklist defined, returning everything...");
  }
  if (blacklist.length) {
    $logger.verbose(`Blacklist defined, will ignore: ${blacklist.join(", ")}`);
  }

  const whitelist = (args.whitelist || []).map(lowercase);
  if (whitelist.length) {
    $logger.verbose(`Whitelist defined, will only return: ${whitelist.join(", ")}...`);
  }

  function isBlacklisted(prop): boolean {
    if (whitelist.length) {
      return !whitelist.includes(lowercase(prop));
    }
    return blacklist.includes(lowercase(prop));
  }

  const searchResultsSort = args.searchResultsSort;
  if (!searchResultsSort) {
    $logger.verbose("searchResultsSort preference not set. Using default 'relevance' value...");
  } else {
    $logger.verbose(`Search results will be ordered by key: ${searchResultsSort}.`);
  }

  // Check imperial unit preference
  const useImperial = args.useImperial;
  if (!useImperial) {
    $logger.verbose("Imperial preference not set. Using metric values...");
  } else {
    $logger.verbose("Imperial preference indicated. Using imperial values...");
  }

  // Check Use Avatar as Thumbnail preference
  const useAvatarAsThumbnail = args.useAvatarAsThumbnail;
  if (!useAvatarAsThumbnail) {
    $logger.verbose("Will not use the Avatar as the Actor Thumbnail...");
  } else {
    $logger.verbose("Will use the Avatar as the Actor Thumbnail...");
  }

  let firstResult: cheerio.Cheerio;
  try {
    $logger.debug(`Searching for ${actorName}`);
    firstResult = await getFirstSearchResult(ctx, actorName);
  } catch (error) {
    $throw(error.message);
    return {}; // return for type compatibility
  }

  if (!firstResult) {
    $throw(`${actorName} not found!`);
  }

  const href = firstResult.attr("href")?.replace("/feed", "");

  let html: string;
  try {
    const url = `https://freeones.com${href}/bio`;
    $logger.debug(`GET ${url}`);
    html = (await $axios.get<string>(url)).data;
  } catch (error) {
    $throw(error.message);
    return {}; // return for type compatibility
  }
  const $ = $cheerio.load(html || "");

  function getNationality(): Partial<{ nationality: string }> {
    if (isBlacklisted("nationality")) return {};
    $logger.verbose("Getting nationality...");

    const selector = $('[data-test="section-personal-information"] a[href*="countryCode%5D"]');

    if (!selector.length) {
      $logger.verbose("Nationality not found");
      return {};
    }

    const nationality = ($(selector).attr("href") || "").split("=").slice(-1)[0];
    if (!nationality) {
      return {};
    }
    return {
      nationality,
    };
  }

  function getHeight(): Partial<{ height: number }> {
    if (isBlacklisted("height")) return {};
    $logger.verbose("Getting height...");

    const selector = $('[data-test="link_height"] .text-underline-always');
    if (!selector) return {};

    const rawHeight = $(selector).text();
    const rawHeightMatch = rawHeight.match(/\d+cm/);
    const cm = rawHeightMatch ? rawHeightMatch[0] : null;
    if (!cm) return {};
    const height = parseInt(cm.replace("cm", ""));
    if (!useImperial) return { height };

    // Convert to imperial
    return { height: cmToFt(height) };
  }

  function getWeight(): Partial<{ weight: number }> {
    if (isBlacklisted("weight")) return {};
    $logger.verbose("Getting weight...");

    const selector = $('[data-test="link_weight"] .text-underline-always');
    if (!selector) return {};

    const rawWeight = $(selector).text();
    const rawWeightMatch = rawWeight.match(/\d+kg/);
    const kg = rawWeightMatch ? rawWeightMatch[0] : null;
    if (!kg) return {};
    const weight = parseInt(kg.replace("kg", ""));
    if (!useImperial) return { weight };

    // Convert to imperial
    return { weight: kgToLbs(weight) };
  }

  function computeZodiac(timestamp: number): string | undefined {
    const inputDate = $moment(timestamp);
    if (!inputDate.isValid()) return;

    const day = inputDate.date();
    const month = inputDate.month();
    // signSwitchDay[i] gives the boundary day between two signs, for the month at index 'i' (according to Britannica Encyclopedia)
    const signSwitchDay = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 22, 22];
    const signAtMonthStart = [
      "Capricorn",
      "Aquarius",
      "Pisces",
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
    ];

    // signSwitchDay[0] gives 20, meaning any day less than 20 at month index 0 (january) is the sign at the start of that month index (capricorn),
    // and any day greater than 20 is the sign at the start of the next month: i+1 (aquarius)
    const isBeforeSwithchDay = day <= signSwitchDay[month];

    // Mod 12 allows us to cycle between 0-11, so if the day is past the boundary day of month index 11 (december), we'll get index 0 (january)
    return signAtMonthStart[isBeforeSwithchDay ? month : (month + 1) % 12];
  }

  function getZodiac(): Partial<{ zodiac: string }> {
    if (isBlacklisted("zodiac")) return {};

    const bornOn = getAge().bornOn;
    if (!bornOn) {
      $logger.verbose("No birth date found => zodiac will be empty.");
      return {};
    }
    const computedZodiac = computeZodiac(bornOn.valueOf());
    $logger.verbose(
      `Computed zodiac sign for: ${new Date(bornOn).toLocaleDateString()}: ${computedZodiac}`
    );

    return { zodiac: computedZodiac };
  }

  function getBirthplace(): Partial<{ birthplace: string }> {
    if (isBlacklisted("birthplace")) return {};
    $logger.verbose("Getting birthplace...");

    const selector = $('[data-test="section-personal-information"] a[href*="placeOfBirth"]');
    const cityName = selector.length
      ? ($(selector).attr("href") || "").split("=").slice(-1)[0]
      : null;

    if (!cityName) {
      $logger.verbose("No birthplace found");
      return {};
    } else {
      const stateSelector = $('[data-test="section-personal-information"] a[href*="province"]');
      const stateName = stateSelector.length
        ? ($(stateSelector).attr("href") || "").split("=").slice(-1)[0]
        : null;
      if (!stateName) {
        $logger.verbose("No birth province found, just city!");
        return { birthplace: cityName };
      } else {
        const bplace = `${cityName}, ${stateName.split("-")[0].trim()}`;
        return { birthplace: bplace };
      }
    }
  }

  function scrapeText<T extends Record<string, string>>(
    prop: string,
    selector: string
  ): Partial<T> {
    if (isBlacklisted(prop)) return {};
    $logger.verbose(`Getting ${prop}...`);

    const el = $(selector);
    if (!el) return {};

    return { [prop]: el.text() } as T;
  }

  async function getAvatar(): Promise<Partial<{ avatar: string; thumbnail: string }>> {
    if (args.dry) return {};
    if (isBlacklisted("avatar") && !useAvatarAsThumbnail) {
      // If not using either avatar or thumbnail, return nothing
      return {};
    }
    $logger.verbose("Getting avatar (and/or thumbnail)...");

    const imgEl = $(`.dashboard-header img.img-fluid`);
    if (!imgEl) return {};

    const url = $(imgEl).attr("src");

    if (!url) return {};

    const imgId = await $createImage(url, `${actorName} (avatar)`);
    const result: Partial<{ avatar: string; thumbnail: string }> = {};

    if (!isBlacklisted("avatar")) {
      result.avatar = imgId;
    }
    if (useAvatarAsThumbnail) {
      result.thumbnail = imgId;
    }

    return result;
  }

  function getAge(): Partial<{ bornOn: number }> {
    if (isBlacklisted("bornOn")) return {};
    $logger.verbose("Getting age...");

    const aTag = $('[data-test="section-personal-information"] a');
    if (!aTag) return {};

    const href = $(aTag).attr("href") || "";
    const yyyymmdd = href.match(/\d\d\d\d-\d\d-\d\d/);

    if (yyyymmdd && yyyymmdd.length) {
      const date = yyyymmdd[0];
      const timestamp = $moment(date, "YYYY-MM-DD").valueOf();
      return {
        bornOn: timestamp,
      };
    } else {
      $logger.verbose("Could not find actor birth date.");
      return {};
    }
  }

  function getAlias(): Partial<{ aliases: string[] }> {
    if (isBlacklisted("aliases")) return {};
    $logger.verbose("Getting aliases...");

    const aliasSel = $('[data-test="section-alias"] p[data-test*="p_aliases"]');
    const aliasText = aliasSel.text();
    const aliasName = aliasText && !/unknown/.test(aliasText) ? aliasText.trim() : null;
    if (!aliasName) return {};
    const aliases = aliasName.split(/,\s*/g);

    return { aliases };
  }

  function getCareer(): Partial<{
    started: number;
    ended: number;
  }> {
    if (isBlacklisted("career")) return {};
    $logger.verbose("Getting career information...");

    const careerSel = $(".timeline-horizontal p.m-0");
    if (!careerSel) return {};

    const career: Partial<{
      started: number;
      ended: number;
    }> = {};

    const careerStart = $(careerSel[0]).text();
    if (careerStart && careerStart !== "Begin") {
      career.started = Number.parseInt(careerStart, 10);
      if (Number.isNaN(career.started)) {
        delete career.started;
      }
    }

    const careerEnd = $(careerSel[1]).text();
    if (careerEnd && careerEnd !== "Now") {
      career.ended = Number.parseInt(careerEnd, 10);
      if (Number.isNaN(career.ended)) {
        delete career.ended;
      }
    }

    return career;
  }

  function scrapeMeasurements(): Measurements | null {
    const measurementParts: string[] = [];
    $('[data-test="p-measurements"] .text-underline-always').each(function (
      this: cheerio.Element,
      i,
      element
    ) {
      measurementParts[i] = $(this).text();
    });
    const measurements = measurementParts.join("-");
    return Measurements.fromString(measurements);
  }

  const measurements = scrapeMeasurements();

  function getMeasurements(): Partial<{ measurements: string }> {
    if (isBlacklisted("measurements")) return {};
    $logger.verbose("Getting measurements...");
    return measurements ? { measurements: measurements.toString() } : {};
  }

  function getWaistSize(): Partial<{ ["waist size"]: number }> {
    if (isBlacklisted("measurements")) return {};
    $logger.verbose("Getting waist size...");
    return measurements ? { "waist size": measurements.waist } : {};
  }

  function getHipSize(): Partial<{ ["hip size"]: number }> {
    if (isBlacklisted("measurements")) return {};
    $logger.verbose("Getting hip size...");
    return measurements ? { "hip size": measurements.hip } : {};
  }

  function getBraSize(): Partial<{
    ["cup size"]: string;
    ["bra size"]: string;
    ["bust size"]: number;
  }> {
    if (isBlacklisted("measurements")) return {};
    $logger.verbose("Getting bra/cup/bust size...");
    return measurements
      ? {
          "cup size": measurements.cup,
          "bra size": measurements.braSize(),
          "bust size": measurements.bust,
        }
      : {};
  }

  function getGender(): Partial<{ sex: string; gender: string }> {
    if (isBlacklisted("gender")) return {};
    return { sex: "Female", gender: "Female" };
  }

  function getTattoos(): Partial<{ tattoos: string | string[] }> {
    if (isBlacklisted("tattoos")) return {};
    let tattooResult = scrapeText<{ tattoos: string }>("tattoos", '[cdata-test="p_has_tattoos"]');
    if (!tattooResult.tattoos) {
      tattooResult = scrapeText<{ tattoos: string }>("tattoos", '[data-test="p_has_tattoos"]');
    }
    const tattooText = tattooResult.tattoos ? tattooResult.tattoos.trim() : "";
    if (!tattooText || /No Tattoos/i.test(tattooText)) {
      return {};
    }

    if (args.tattoosType === "array") {
      return { tattoos: tattooText.split(";").map((s) => s.trim()) };
    }

    return { tattoos: tattooText };
  }

  function getPiercings(): Partial<{ piercings: string | string[] }> {
    if (isBlacklisted("piercings")) return {};
    const res: { piercings?: string } = scrapeText<{ piercings: string }>(
      "piercings",
      '[data-test="p_has_piercings"]'
    );
    const piercingText = res.piercings?.trim();
    if (!piercingText || /No Piercings/i.test(piercingText)) {
      return {};
    }

    if (args.piercingsType === "array") {
      return { piercings: piercingText.split(";").map((s) => s.trim()) };
    }

    return { piercings: piercingText };
  }

  const custom = {
    ...scrapeText<{ ["hair color"]: string }>(
      "hair color",
      '[data-test="link_hair_color"] .text-underline-always'
    ),
    ...scrapeText<{ ["eye color"]: string }>(
      "eye color",
      '[data-test="link_eye_color"] .text-underline-always'
    ),
    ...scrapeText<{ ethnicity: string }>(
      "ethnicity",
      '[data-test="link_ethnicity"] .text-underline-always'
    ),
    ...getHeight(),
    ...getWeight(),
    ...getMeasurements(),
    ...getWaistSize(),
    ...getHipSize(),
    ...getBraSize(),
    ...getBirthplace(),
    ...getZodiac(),
    ...getGender(),
    ...getTattoos(),
    ...getCareer(),
    ...getPiercings(),
  };

  if (custom.tattoos === "Unknown") {
    delete custom.tattoos;
  }

  const data: ActorOutput = {
    ...getNationality(),
    ...getAge(),
    ...getAlias(),
    ...(await getAvatar()),
    custom,
  };

  if (!isBlacklisted("labels")) {
    data.labels = [];
    if (custom["hair color"]) {
      data.labels.push(`${custom["hair color"]} Hair`);
    }
    if (custom["eye color"]) {
      data.labels.push(`${custom["eye color"]} Eyes`);
    }
    if (custom.ethnicity) {
      data.labels.push(custom.ethnicity);
    }
    if (custom.gender) {
      data.labels.push("Female");
    }
    if (custom.piercings) {
      data.labels.push("Piercings");
    }
    if (custom.tattoos) {
      data.labels.push("Tattoos");
    }
  }

  if (args.dry === true) {
    $logger.info(`Would have returned: ${$formatMessage(data)}`);
    return {};
  }
  return data;
};

handler.requiredVersion = ">=0.27.0";

applyMetadata(handler, info);

module.exports = handler;

export default handler;
