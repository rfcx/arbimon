/**
 * UTC-offset helpers shared by the staging table's Zone column, the bulk Zone
 * corrector, and the site-vs-rows discrepancy check.
 *
 * WHY THIS EXISTS: the Zone column renders an OFFSET (`UTC-6`), while a site
 * carries an IANA TIMEZONE (`America/Costa_Rica`). Comparing the two naively —
 * by resolving the site zone's offset "now" — is wrong for any zone that
 * observes DST: recordings made in July compared against an offset computed in
 * January differ by an hour and look discrepant when they are perfectly
 * correct. Every comparison here is therefore resolved AT A GIVEN INSTANT.
 *
 * Pure functions, no dependencies (this package backs a future desktop shell).
 */

/** `UTC`, `UTC-6`, `UTC+4:30` — the format the Zone column already renders. */
export const formatUtcOffsetLabel = (offsetMinutes: number): string => {
  if (offsetMinutes === 0) return 'UTC'
  const sign = offsetMinutes < 0 ? '-' : '+'
  const abs = Math.abs(offsetMinutes)
  const hours = Math.floor(abs / 60)
  const mins = abs % 60
  return `UTC${sign}${hours}${mins !== 0 ? `:${String(mins).padStart(2, '0')}` : ''}`
}

/** Inverse of {@link formatUtcOffsetLabel}. `undefined` when unparseable. */
export const parseUtcOffsetLabel = (label: string): number | undefined => {
  if (label === 'UTC') return 0
  const match = label.match(/^UTC([+-])(\d{1,2})(?::(\d{2}))?$/)
  if (match === null) return undefined
  const [, sign, hours, mins] = match
  const total = parseInt(hours) * 60 + (mins !== undefined ? parseInt(mins) : 0)
  return sign === '-' ? -total : total
}

/**
 * The offset an IANA zone was at A SPECIFIC INSTANT — DST-correct.
 *
 * Derived from `Intl.DateTimeFormat` rather than a tz library: format the
 * instant in the target zone, read it back as if it were UTC, and the
 * difference is the offset. `undefined` for an unknown zone name.
 */
export const zoneOffsetAt = (timeZone: string, instant: Date): number | undefined => {
  if (timeZone === '') return undefined
  if (timeZone === 'UTC') return 0
  try {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
        .formatToParts(instant)
        .map(part => [part.type, part.value])
    )
    const asUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      // Intl can emit hour '24' at midnight in some locales/zones.
      Number(parts.hour === '24' ? '0' : parts.hour),
      Number(parts.minute),
      Number(parts.second)
    )
    if (Number.isNaN(asUtc)) return undefined
    return Math.round((asUtc - instant.getTime()) / 60_000)
  } catch {
    return undefined
  }
}

/**
 * A row's own offset, derived from the two timestamps it already carries:
 * `offset = localWallTime - timestampUtc`. DST-correct by construction,
 * because both values describe the SAME instant.
 *
 * `undefined` when the row never resolved a timestamp (a genuine error row) —
 * such a row has no zone to compare or to change.
 */
export const rowOffsetMinutes = (
  localWallTime: string | undefined,
  timestampUtc: string | undefined
): number | undefined => {
  if (localWallTime === undefined || timestampUtc === undefined) return undefined
  const wall = Date.parse(`${localWallTime}Z`)
  const utc = Date.parse(timestampUtc)
  if (Number.isNaN(wall) || Number.isNaN(utc)) return undefined
  return Math.round((wall - utc) / 60_000)
}

/**
 * Re-anchor a recording to a different UTC offset, HOLDING THE WALL CLOCK
 * CONSTANT.
 *
 * This is the semantic of the bulk Zone corrector: the user is not changing
 * when the recording happened on the recorder's clock (14:30 stays 14:30) —
 * they are correcting which zone that clock was in, which moves the absolute
 * instant. Returns the new `timestampUtc`, or `undefined` if there is no wall
 * time to re-anchor.
 */
export const retimestampToOffset = (
  localWallTime: string | undefined,
  offsetMinutes: number
): string | undefined => {
  if (localWallTime === undefined) return undefined
  const wall = Date.parse(`${localWallTime}Z`)
  if (Number.isNaN(wall)) return undefined
  return new Date(wall - offsetMinutes * 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z')
}

/**
 * Every valid UTC offset, as `{ value, label }`, for the corrector dropdown.
 *
 * Deliberately the REAL-WORLD set rather than every 15-minute step from -12 to
 * +14: zones in use run -12:00 … +14:00 and include :30 and :45 members
 * (India +5:30, Nepal +5:45, Chatham +12:45). Listing impossible offsets would
 * pad the list with ~60 entries nobody can pick correctly.
 */
export const UTC_OFFSET_OPTIONS: Array<{ value: number, label: string }> = (() => {
  const minutes = [
    -720, -660, -600, -570, -540, -480, -420, -360, -300, -240, -210, -180,
    -120, -60, 0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420,
    480, 525, 540, 570, 600, 630, 660, 720, 765, 780, 840
  ]
  return minutes.map(value => ({ value, label: formatUtcOffsetLabel(value) }))
})()