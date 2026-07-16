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
  '%Z': '(?<timezone>\\+[0-9][0-9][0-9][0-9])',
  '%z': '(?<timezone>[A-Z][A-Z][A-Z])'
}

export const parseTimestampWithFormat = (
  fileName: string,
  timestampFormat: string
): string | undefined => {
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
