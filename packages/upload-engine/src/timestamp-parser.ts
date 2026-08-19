/**
 * Filename → recording-timestamp parsing.
 *
 * TypeScript port of the desktop uploader's parsing logic
 * (arbimon-uploader utils/dateHelper.js): auto-detect patterns, explicit
 * %-token formats, and AudioMoth legacy unix-hex names. Pure functions, no
 * dependencies — the same code will back the desktop rebuild.
 */

export const TIMESTAMP_FORMAT_AUTO = 'Auto-detect'
export const TIMESTAMP_FORMAT_UNIX_HEX = 'AudioMoth legacy (Unix Hex)'

interface ParsedParts {
  year?: string
  month?: string
  day?: string
  hour?: string
  minute?: string
  second?: string
  hour12?: string
  hour12ap?: string
  timezone?: string
}

const MONTH_NAMES: Record<string, string> = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12'
}

const pad2 = (value: string): string => value.padStart(2, '0')

/**
 * Normalize regex capture groups to a local-naive ISO string
 * `YYYY-MM-DDTHH:mm:ss` (+ optional offset when the filename carried one).
 * Mirrors the desktop app's formatIso().
 */
const formatIso = (parts: ParsedParts): string | undefined => {
  let { year, month, day, hour, second, timezone } = parts
  const { minute, hour12, hour12ap } = parts
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    minute === undefined
  ) {
    return undefined
  }
  if (year.length === 2) year = `20${year}`
  const monthName = MONTH_NAMES[month.toLowerCase()]
  if (monthName !== undefined) month = monthName
  if (hour12 !== undefined && hour12ap !== undefined) {
    const ap = hour12ap.toLowerCase()
    hour = ap === 'pm' || ap === 'p' ? String(parseInt(hour12) + 12) : hour12
  }
  if (hour === undefined) return undefined
  second ??= '00'
  timezone ??= ''
  return `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(
    minute
  )}:${pad2(second)}${timezone}`
}

/** %-token format string → regex (same token set as the desktop app). */
const FORMAT_TOKENS: Record<string, string> = {
  '%Y': '(?<year>[1-9][0-9][0-9][0-9])',
  '%y': '(?<year>[0-9][0-9])',
  '%M': '(?<month>[0-1][0-9])',
  '%m': '(?<month>1?[0-9])',
  '%N': '(?<month>January|February|March|April|May|June|July|August|September|October|November|December)',
  '%n': '(?<month>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)',
  '%D': '(?<day>[0-3][0-9])',
  '%d': '(?<day>[1-3]?[0-9])',
  '%H': '(?<hour>[0-2][0-9])',
  '%h': '(?<hour>[1-2]?[0-9])',
  '%G': '(?<hour12>0[0-9]|1[0-1])',
  '%g': '(?<hour12>[0-9]|1[0-1])',
  '%A': '(?<hour12ap>AM|PM|am|pm)',
  '%a': '(?<hour12ap>A|P|a|p)',
  '%I': '(?<minute>[0-5][0-9])',
  '%i': '(?<minute>[1-5]?[0-9])',
  '%S': '(?<second>[0-5][0-9])',
  '%s': '(?<second>[1-5]?[0-9])',
  // NEGATIVE OFFSETS ACCEPTED (fixed 2026-08-19). The desktop original
  // (arbimon-uploader utils/dateHelper.js:60) hardcoded `\+`, and this port
  // inherited it faithfully -- so every recorder west of UTC (all of the
  // Americas) could not express its own filenames with %Z.
  //
  // Confirmed a defect, not a deliberate restriction, on three counts:
  //  1. `toUtcIso` already converts negative offsets correctly (measured);
  //  2. the AUTO-detect path already accepts both signs
  //     (`detectFilenameOffset` in analyze.ts matches `[+-]`), so the codebase
  //     contradicted itself -- auto-detect read `-0500` while a user's own %Z
  //     format refused it;
  //  3. nothing downstream distinguishes the sign.
  // Also accepts the `-05:00` colon form, which ISO-8601 permits and which
  // `toUtcIso`/`stripOffset` already handle.
  '%Z': '(?<timezone>[+-][0-9][0-9]:?[0-9][0-9])',
  '%z': '(?<timezone>[A-Z][A-Z][A-Z])'
}

/**
 * Every `%X` occurrence in a format string, EXCLUDING the `%%` escape for a
 * literal percent. Matched as pairs so `%%Y` reads as (literal %) + (%Y) and
 * `%%` never registers as the unknown token `%`.
 */
const formatTokensIn = (timestampFormat: string): string[] =>
  (timestampFormat.match(/%%|%./g) ?? []).filter(token => token !== '%%')

/** Why a format string was rejected — lets the UI say something specific. */
export type TimestampFormatError =
  | 'empty'
  | 'no-tokens'
  | 'unknown-token'
  | 'duplicate-token'

/**
 * Validate a `%`-token format string, returning the specific reason it fails.
 *
 * Rejects three cases the parser cannot express, each of which would otherwise
 * fail SILENTLY (returning `undefined` with no reason the user could act on):
 *
 *  1. `duplicate-token` (`%Y_%Y`). Substitution replaces one token at a time,
 *     so a repeat leaves a raw `%Y` in the pattern and nothing ever matches.
 *     Substituting globally instead is NOT a fix: each token expands to a
 *     NAMED capture group, and emitting one twice throws
 *     `SyntaxError: Duplicate capture group name`. Measured, not assumed.
 *  2. `unknown-token` (`%Q`) — not in FORMAT_TOKENS, so it stays literal and
 *     silently prevents any match.
 *  3. `no-tokens` — a plain string can only match itself, which is never what
 *     someone typing a "format" intends.
 *
 * NOTE: this rule is mirrored server-side in the API (a saved format must be
 * validated before it reaches the database; the client cannot be trusted). The
 * duplicate lives in `apps/api` rather than a shared package ON PURPOSE: this
 * package is deliberately dependency-free so it can back the desktop rebuild,
 * and `@rfcx-bio/common` cannot be imported here without breaking that. The
 * API's copy carries a pointer back to this function.
 */
export const validateTimestampFormat = (timestampFormat: string): TimestampFormatError | undefined => {
  if (timestampFormat === '') return 'empty'

  const tokens = formatTokensIn(timestampFormat)
  if (tokens.length === 0) return 'no-tokens'
  if (tokens.some(token => !(token in FORMAT_TOKENS))) return 'unknown-token'
  if (new Set(tokens).size !== tokens.length) return 'duplicate-token'

  return undefined
}

/**
 * Convenience boolean form of {@link validateTimestampFormat}. Exported so the
 * UI can validate as the user types and explain the problem, rather than
 * leaving them to guess why every row failed to parse.
 */
export const isValidTimestampFormat = (timestampFormat: string): boolean =>
  validateTimestampFormat(timestampFormat) === undefined

/** User-facing explanation for each rejection reason. */
export const TIMESTAMP_FORMAT_ERROR_TEXT: Record<TimestampFormatError, string> = {
  empty: 'Enter a pattern.',
  'no-tokens': 'A pattern needs at least one token, for example %Y for the year.',
  'unknown-token': 'That pattern uses a token Arbimon does not recognise.',
  'duplicate-token': 'Each token can only be used once in a pattern.'
}

/** Human-readable meaning for each token — used by the format-editor palette. */
export const TIMESTAMP_FORMAT_TOKEN_LABELS: Record<string, string> = {
  '%Y': '4-digit year (2024)',
  '%y': '2-digit year (24)',
  '%M': 'month, 2-digit (03)',
  '%m': 'month (3)',
  '%N': 'month name (March)',
  '%n': 'month abbreviated (Mar)',
  '%D': 'day, 2-digit (05)',
  '%d': 'day (5)',
  '%H': 'hour 24h, 2-digit (08)',
  '%h': 'hour 24h (8)',
  '%G': 'hour 12h, 2-digit (08)',
  '%g': 'hour 12h (8)',
  '%A': 'AM/PM',
  '%a': 'A/P',
  '%I': 'minute, 2-digit (45)',
  '%i': 'minute (45)',
  '%S': 'second, 2-digit (10)',
  '%s': 'second (10)',
  '%Z': 'timezone offset (-0500)',
  // ⚠ %z MATCHES but does not RESOLVE: a zone abbreviation like 'EST' is
  // carried into the parsed string, where `toUtcIso` cannot interpret it and
  // returns undefined (measured 2026-08-19). Kept for desktop parity and
  // because the abbreviation still marks where the zone sits in the filename,
  // but %Z is the token that actually determines an instant.
  '%z': 'timezone name (UTC)'
}

/**
 * Palette metadata for the format editor: a SHORT name, the accepted RANGE, and
 * a concrete example per token, grouped by the part of the timestamp they fill.
 *
 * Why this exists alongside TIMESTAMP_FORMAT_LABELS: a single label string has
 * to be read one-at-a-time on hover, which is invisible on touch and impossible
 * to scan. The editor renders name + range + example as VISIBLE columns, so a
 * user picking between `%H` and `%G` can see the difference instead of
 * discovering it from a filename that silently fails to parse.
 *
 * ⚠ The `range` values are MEASURED against FORMAT_TOKENS above, not paraphrased
 * from intent — three of them are genuinely surprising and each is a real trap:
 *  - `%G`/`%g` match 00-11 ONLY, so a 12 o'clock hour does NOT parse.
 *  - `%Z` matches a LEADING-PLUS offset only; `-0500` does not match.
 *  - `%z` is UPPERCASE only; `utc` does not match.
 * Keep this table honest against the regexes; a wrong range here sends users
 * down exactly the debugging path the palette exists to prevent.
 */
export interface TimestampTokenInfo {
  token: string
  /** Short noun phrase for the token's role, e.g. 'Year, 4-digit'. */
  name: string
  /** What it actually accepts, phrased for a human. */
  range: string
  /** A literal example of matching text. */
  example: string
}

export type TimestampTokenGroupKey = 'date' | 'time' | 'zone'

/** One column of the palette: a timestamp FIELD (Year, Month, Hour...) with
 *  its token variants stacked beneath. */
export interface TimestampTokenField {
  label: string
  tokens: TimestampTokenInfo[]
}

/**
 * Grouped BY FIELD (operator 2026-08-19): each group renders its fields as
 * COLUMNS -- Year | Month | Day -- with the variants of one field stacked in
 * one column. The column header carries the field name, so token `name`s are
 * just the variant ('4-digit', 'no zero', 'Full name'). Before this the
 * variants of one field were scattered across a row-major grid, so comparing
 * "which month token do I want?" meant scanning non-adjacent cells.
 */
export const TIMESTAMP_TOKEN_GROUPS: Array<{
  key: TimestampTokenGroupKey
  label: string
  fields: TimestampTokenField[]
}> = [
  {
    key: 'date',
    label: 'Date',
    fields: [
      {
        label: 'Year',
        tokens: [
          { token: '%Y', name: '4-digit', range: '1000–9999', example: '2024' },
          { token: '%y', name: '2-digit', range: '00–99 → 20xx', example: '24' }
        ]
      },
      {
        label: 'Month',
        tokens: [
          { token: '%M', name: '2-digit', range: '01–12', example: '03' },
          { token: '%m', name: 'no zero', range: '1–12', example: '3' },
          { token: '%N', name: 'full name', range: 'January–December', example: 'March' },
          { token: '%n', name: 'short name', range: 'Jan–Dec', example: 'Mar' }
        ]
      },
      {
        label: 'Day',
        tokens: [
          { token: '%D', name: '2-digit', range: '01–31', example: '05' },
          { token: '%d', name: 'no zero', range: '1–31', example: '5' }
        ]
      }
    ]
  },
  {
    key: 'time',
    label: 'Time',
    fields: [
      {
        label: 'Hour',
        tokens: [
          { token: '%H', name: '24h, 2-digit', range: '00–23', example: '18' },
          { token: '%h', name: '24h, no zero', range: '0–23', example: '8' },
          // MEASURED: the regex is 0[0-9]|1[0-1] -- 12 does NOT match.
          { token: '%G', name: '12h, 2-digit', range: '00–11 (not 12)', example: '08' },
          { token: '%g', name: '12h, no zero', range: '0–11 (not 12)', example: '8' }
        ]
      },
      {
        label: 'Minute',
        tokens: [
          { token: '%I', name: '2-digit', range: '00–59', example: '45' },
          { token: '%i', name: 'no zero', range: '0–59', example: '45' }
        ]
      },
      {
        label: 'Second',
        tokens: [
          { token: '%S', name: '2-digit', range: '00–59', example: '10' },
          { token: '%s', name: 'no zero', range: '0–59', example: '10' }
        ]
      },
      {
        label: 'AM / PM',
        tokens: [
          { token: '%A', name: 'AM / PM', range: 'AM, PM, am, pm', example: 'PM' },
          { token: '%a', name: 'A / P', range: 'A, P, a, p', example: 'P' }
        ]
      }
    ]
  },
  {
    key: 'zone',
    label: 'Time zone',
    fields: [
      {
        label: 'UTC offset',
        tokens: [
          { token: '%Z', name: '±hhmm', range: '±hhmm', example: '-0500' }
        ]
      },
      {
        label: 'Abbreviation',
        tokens: [
          // MEASURED: [A-Z]{3} -- lowercase does not match. NOTE this token also
          // does not RESOLVE to an offset downstream (see the warning on
          // TIMESTAMP_FORMAT_TOKEN_LABELS); prefer %Z.
          { token: '%z', name: '3 capitals', range: '3 capitals', example: 'UTC' }
        ]
      }
    ]
  }
]

export const parseTimestampWithFormat = (
  fileName: string,
  timestampFormat: string
): string | undefined => {
  // Guard first: an invalid format can only ever produce a non-match (or, for
  // a duplicate token under a global substitution, a thrown SyntaxError), so
  // there is nothing to gain by attempting it.
  if (!isValidTimestampFormat(timestampFormat)) return undefined

  let regExpString = timestampFormat
  for (const [token, pattern] of Object.entries(FORMAT_TOKENS)) {
    regExpString = regExpString.replace(token, pattern)
  }
  const result = new RegExp(regExpString, 'g').exec(fileName)
  if (result?.groups === undefined) return undefined
  return formatIso(result.groups as ParsedParts)
}

/** Ordered auto-detect patterns (same order/shapes as the desktop app). */
const AUTO_PATTERNS: string[] = [
  // [a-zA-Z]{3}[0-9]{4} prefix + Y-M-D
  '(?<string>[a-zA-Z]{3}[0-9]{4})[-._ ]?(?<year>(19|20)[0-9][0-9])[- /._]?(?<month>0[1-9]|1[012])[- /._]?(?<day>0[1-9]|[12][0-9]|3[01]).?(?<hour>[0-1][0-9]|2[0-3])[- :.]?(?<minute>[0-5][0-9])[- :.]?(?<second>[0-5][0-9])?',
  // long letter prefix + Y-M-D
  '(?<string>[a-zA-Z]{6}[-._ ]?[a-zA-Z]{3}[-._ ]?[a-zA-Z]{3}[-._ ]?[a-zA-Z]{3}[-._ ]?[a-zA-Z]{2}[0-9]{2})[-._ ]?(?<year>(19|20)[0-9][0-9])[- /._]?(?<month>0[1-9]|1[012])[- /._]?(?<day>0[1-9]|[12][0-9]|3[01]).?(?<hour>[0-1][0-9]|2[0-3])[- :.]?(?<minute>[0-5][0-9])[- :.]?(?<second>[0-5][0-9])?',
  // YYYY-MM-DD HHMMSS (e.g. AudioMoth modern, SongMeter)
  '(?<year>(19|20)[0-9][0-9])[- /.]?(?<month>0[1-9]|1[012])[- /.]?(?<day>0[1-9]|[12][0-9]|3[01]).?(?<hour>[0-1][0-9]|2[0-3])[- :.]?(?<minute>[0-5][0-9])[- :.]?(?<second>[0-5][0-9])?',
  // DD-MM-YYYY
  '(?<day>0[1-9]|[12][0-9]|3[01])[- /.]?(?<month>0[1-9]|1[012])[- /.]?(?<year>(19|20)[0-9][0-9]).?(?<hour>[0-1][0-9]|2[0-3])[- :.]?(?<minute>[0-5][0-9])[- :.]?(?<second>[0-5][0-9])?',
  // YY-MM-DD
  '(?<year>[0-9][0-9])[- /.]?(?<month>0[1-9]|1[012])[- /.]?(?<day>0[1-9]|[12][0-9]|3[01]).?(?<hour>[0-1][0-9]|2[0-3])[- :.]?(?<minute>[0-5][0-9])[- :.]?(?<second>[0-5][0-9])?',
  // DD-MM-YY
  '(?<day>0[1-9]|[12][0-9]|3[01])[- /.]?(?<month>0[1-9]|1[012])[- /.]?(?<year>[0-9][0-9]).?(?<hour>[0-1][0-9]|2[0-3])[- :.]?(?<minute>[0-5][0-9])[- :.]?(?<second>[0-5][0-9])?'
]

export const parseTimestampAuto = (fileName: string): string | undefined => {
  for (const pattern of AUTO_PATTERNS) {
    const result = new RegExp(pattern, 'g').exec(fileName)
    if (result?.groups !== undefined) {
      return formatIso(result.groups as ParsedParts)
    }
  }
  return undefined
}

/**
 * A user's saved filename format, as the ENGINE sees it.
 *
 * Structurally identical to `UserTimestampFormat` in `@rfcx-bio/common`, but
 * declared LOCALLY on purpose: this package is deliberately dependency-free so
 * it can also back the desktop rebuild, and importing the app's DAO types would
 * break that. The two are kept in step BY SHAPE, not by a shared import — the
 * same conscious duplication the API's validator carries (see
 * `validateTimestampFormat`). Only the fields the parser actually needs are
 * declared, so a widening of the DAO type cannot break this package.
 */
export interface SavedTimestampFormat {
  id: string
  label: string
  format: string
}

/** Which rule recognised a filename's timestamp. */
export interface TimestampMatch {
  /** The parsed timestamp: local-naive, or offset-carrying for `%Z` formats. */
  timestamp: string
  /** `auto` = a built-in pattern; `saved` = one of the user's own formats. */
  source: 'auto' | 'saved'
  /** Set only when `source === 'saved'` — identifies WHICH entry matched. */
  formatId?: string
  /** The saved format's human label, for display on a staged row. */
  formatLabel?: string
}

/**
 * Parse a filename against the built-in patterns FIRST, then the user's saved
 * formats in list order, reporting which one matched.
 *
 * ORDERING IS AN OPERATOR DECISION (2026-08-18), and the two halves of it pull
 * in opposite directions, so the resolution is recorded here:
 *
 *  - "Saved formats AUGMENT auto-detect, never replace it — adding one can
 *    never break a filename that already parsed." That guarantee ONLY holds if
 *    the built-in patterns are tried first, which is what this does.
 *  - "First in list wins", and "a loose user format can shadow a correct auto
 *    pattern" — which would require the opposite order.
 *
 * The first rule is the binding one (it is stated with its rationale, and it is
 * the one that protects existing users' working uploads), so `AUTO_PATTERNS`
 * run first and "first in list wins" governs precedence AMONG the saved
 * formats. The shadowing concern is not dismissed — it is real, just narrower
 * than stated: a saved format can still produce a WRONG-but-valid parse for a
 * file the built-ins failed on, and an early loose saved format still shadows a
 * later, more specific one. Both are exactly why the matching format is
 * REPORTED rather than silently applied — the staged row names it, so a user
 * can see that their own format, not auto-detect, produced a suspect date.
 *
 * Invalid saved formats are skipped rather than throwing:
 * `parseTimestampWithFormat` already refuses them (returning `undefined`), and
 * the API validates on write, so a bad entry can only reach here via stored
 * data that predates validation. Skipping degrades to auto-detect instead of
 * failing the whole analysis.
 */
export const matchTimestamp = (
  fileName: string,
  savedFormats: SavedTimestampFormat[] = []
): TimestampMatch | undefined => {
  const auto = parseTimestampAuto(fileName)
  if (auto !== undefined) return { timestamp: auto, source: 'auto' }

  for (const saved of savedFormats) {
    const parsed = parseTimestampWithFormat(fileName, saved.format)
    if (parsed !== undefined) {
      return {
        timestamp: parsed,
        source: 'saved',
        formatId: saved.id,
        formatLabel: saved.label
      }
    }
  }

  return undefined
}

/**
 * Render a `%`-token format as a filename would look, for a given moment.
 *
 * The INVERSE of `parseTimestampWithFormat`, and deliberately built to satisfy
 * that relationship: rendering a format and parsing the result back must return
 * the same instant. The unit tests assert exactly that round-trip, which is what
 * keeps this table honest against FORMAT_TOKENS.
 *
 * Values come from the date's LOCAL fields, because the example answers "what
 * would a file recorded right now, on this machine, be called?".
 *
 * TWO DELIBERATE ASYMMETRIES, both inherited from the parser's REAL ranges (see
 * TIMESTAMP_TOKEN_GROUPS):
 *  - `%G`/`%g` render `hour % 12`, so noon and midnight render as `0`, not `12`.
 *    That reads oddly but is CORRECT and round-trips: the parser's 12-hour token
 *    matches 00-11 and adds 12 for PM, so 12:00 -> `0` + `PM` -> 12:00 again.
 *  - `%Z` renders the true local offset, including a negative one (e.g. `-0400`).
 *    The parser accepts both signs as of 2026-08-19, so this round-trips; before
 *    that fix the renderer deliberately showed the honest `-` that the parser
 *    would then have rejected, which is how the defect was spotted.
 */
export const renderFormatExample = (
  timestampFormat: string,
  date: Date = new Date(),
  options: { offsetMinutes?: number, zoneAbbreviation?: string } = {}
): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  const hour12 = hour % 12
  const isPm = hour >= 12

  // getTimezoneOffset() is minutes BEHIND UTC (positive west), so negate it.
  const offsetMinutes = options.offsetMinutes ?? -date.getTimezoneOffset()
  const offsetSign = offsetMinutes < 0 ? '-' : '+'
  const offsetAbs = Math.abs(offsetMinutes)
  const offset = `${offsetSign}${pad2(String(Math.floor(offsetAbs / 60)))}${pad2(String(offsetAbs % 60))}`

  const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const values: Record<string, string> = {
    '%Y': String(year),
    '%y': pad2(String(year % 100)),
    '%M': pad2(String(month)),
    '%m': String(month),
    '%N': MONTHS_LONG[month - 1],
    '%n': MONTHS_LONG[month - 1].slice(0, 3),
    '%D': pad2(String(day)),
    '%d': String(day),
    '%H': pad2(String(hour)),
    '%h': String(hour),
    '%G': pad2(String(hour12)),
    '%g': String(hour12),
    '%A': isPm ? 'PM' : 'AM',
    '%a': isPm ? 'P' : 'A',
    '%I': pad2(String(minute)),
    '%i': String(minute),
    '%S': pad2(String(second)),
    '%s': String(second),
    '%Z': offset,
    '%z': options.zoneAbbreviation ?? 'UTC'
  }

  // ONE left-to-right pass, so a rendered VALUE can never be re-substituted.
  // DEFENSIVE, not currently load-bearing: every token is `%X`, so a rendered
  // value ('March') contains no `%` and cannot be re-matched -- verified by
  // mutation (replace-per-token survives today). It matters the moment a
  // bare-letter token is added, and costs nothing now.
  return timestampFormat.replace(/%%|%./g, match =>
    match === '%%' ? '%' : values[match] ?? match)
}

const isHex = (value: string): boolean => {
  if (!/^[0-9a-fA-F]+$/.test(value)) return false
  const num = parseInt(value, 16)
  return num.toString(16).toLowerCase() === value.toLowerCase()
}

/** AudioMoth legacy names: hex seconds since epoch, e.g. 5A3D64A0.WAV. */
export const parseTimestampUnixHex = (
  fileNameWithExtension: string
): string | undefined => {
  const fileName = fileNameWithExtension.replace(/\.[^/.]+$/, '')
  if (!isHex(fileName)) return undefined
  const epochSeconds = parseInt(fileName, 16)
  const date = new Date(epochSeconds * 1000)
  if (isNaN(date.getTime())) return undefined
  return date.toISOString()
}

/**
 * Parse a filename into a local-naive or offset-carrying ISO timestamp.
 * `format` mirrors the desktop app's per-site setting.
 */
export const parseTimestamp = (
  fileName: string,
  format: string = TIMESTAMP_FORMAT_AUTO
): string | undefined => {
  switch (format) {
    case TIMESTAMP_FORMAT_AUTO:
      return parseTimestampAuto(fileName)
    case TIMESTAMP_FORMAT_UNIX_HEX:
      return parseTimestampUnixHex(fileName)
    default:
      return parseTimestampWithFormat(fileName, format)
  }
}

/**
 * Resolve a parsed (possibly local-naive) timestamp to UTC ISO-8601, given
 * an optional IANA timezone or fixed offset-minutes. Port of the desktop
 * app's getUtcTimestamp() decision ladder:
 *  1. explicit offset in the parsed string wins,
 *  2. numeric offset-minutes,
 *  3. no timezone / 'utc' → assume UTC,
 *  4. IANA zone name → convert via Intl.
 */
export const toUtcIso = (
  parsedTimestamp: string,
  timezone?: string | number
): string | undefined => {
  const hasExplicitOffset = /(Z|[+-]\d{2}:?\d{2})$/.test(parsedTimestamp)
  if (hasExplicitOffset) {
    const date = new Date(parsedTimestamp)
    return isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  if (typeof timezone === 'number' && Number.isFinite(timezone)) {
    const date = new Date(`${parsedTimestamp}Z`)
    if (isNaN(date.getTime())) return undefined
    return new Date(date.getTime() - timezone * 60_000).toISOString()
  }
  if (
    timezone === undefined ||
    timezone === '' ||
    String(timezone).toLowerCase() === 'utc'
  ) {
    const date = new Date(`${parsedTimestamp}Z`)
    return isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  // IANA zone: find the UTC instant whose wall-clock in `timezone` matches.
  const naive = new Date(`${parsedTimestamp}Z`)
  if (isNaN(naive.getTime())) return undefined
  const offsetAt = (utcMs: number): number => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: String(timezone),
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    const parts = formatter.formatToParts(new Date(utcMs))
    const get = (type: string): number =>
      parseInt(parts.find(p => p.type === type)?.value ?? '0')
    const asUtc = Date.UTC(
      get('year'),
      get('month') - 1,
      get('day'),
      get('hour') % 24,
      get('minute'),
      get('second')
    )
    return asUtc - utcMs
  }
  // Two-pass fixed-point (handles DST edges the same way moment-tz does).
  let guess = naive.getTime() - offsetAt(naive.getTime())
  guess = naive.getTime() - offsetAt(guess)
  const date = new Date(guess)
  return isNaN(date.getTime()) ? undefined : date.toISOString()
}
