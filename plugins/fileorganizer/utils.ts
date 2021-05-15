import { IReplacementCharacter, MySceneContext } from "./main";

export function toNormalizedSafeFilename(ctx: MySceneContext, unsafeName: string): string {
  let safeFileName = sanitize(unsafeName, ctx.args.characterReplacement);

  if (ctx.args.normalizeAccents) {
    // Normalize file name to unaccented unicode format
    safeFileName = safeFileName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  if (ctx.args.normalizeMultipleSpaces) {
    safeFileName = safeFileName.replace(/ {2,}/g, " ");
  }

  return safeFileName.trim();
}

/**
 * Replaces characters in strings that are illegal/unsafe for filenames.
 * Unsafe characters are either removed or replaced by a substitute set
 * in the optional `options` object.
 *
 * Illegal Characters on Various Operating Systems
 * / ? < > \ : * | "
 * https://kb.acronis.com/content/39790
 *
 * Unicode Control codes
 * C0 0x00-0x1f & C1 (0x80-0x9f)
 * http://en.wikipedia.org/wiki/C0_and_C1_control_codes
 *
 * Reserved filenames on Unix-based systems (".", "..")
 * Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
 * "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
 * "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
 * "LPT9") case-insensitively and with or without filename extensions.
 *
 * @param input Original filename
 * @param replacement Explicit character replacements
 * @returns Sanitized filename
 */
export function sanitize(input: string, replacement?: IReplacementCharacter[]): string {
  const illegalRe = /[/?<>\\:*|"]/g;
  // eslint-disable-next-line no-control-regex
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;
  const reservedRe = /^\.+$/;
  const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
  const windowsTrailingRe = /[. ]+$/;

  if (typeof input !== "string") {
    throw new Error("Input must be string");
  }

  let sanitized = input;
  // Explicit replacements chars from the plugin args
  if (replacement) {
    replacement.forEach((e) => {
      sanitized = sanitized.replace(e.original, e.replacement);
    });
  }

  // All other replacements (including illegal chars that might be in the user's replacement config)
  sanitized = sanitized
    .replace(illegalRe, "")
    .replace(controlRe, "")
    .replace(reservedRe, "")
    .replace(windowsReservedRe, "")
    .replace(windowsTrailingRe, "");
  return sanitized;
}
