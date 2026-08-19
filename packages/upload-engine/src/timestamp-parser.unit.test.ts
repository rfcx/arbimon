import { describe, expect, test } from 'vitest'

import { isValidTimestampFormat, matchTimestamp, parseTimestamp, parseTimestampAuto, parseTimestampUnixHex, parseTimestampWithFormat, TIMESTAMP_FORMAT_UNIX_HEX, toUtcIso } from './timestamp-parser'

describe('parseTimestampAuto', () => {
  test('AudioMoth modern: YYYYMMDD_HHMMSS', () => {
    expect(parseTimestampAuto('20210608_192640.WAV')).toBe(
      '2021-06-08T19:26:40'
    )
  })

  test('SongMeter style: PREFIX_YYYYMMDD_HHMMSS', () => {
    expect(parseTimestampAuto('SMA04563_20220301_063000.wav')).toBe(
      '2022-03-01T06:30:00'
    )
  })

  test('dashed dates with time', () => {
    expect(parseTimestampAuto('site-2023-11-05 08-15-30.flac')).toBe(
      '2023-11-05T08:15:30'
    )
  })

  test('DD-MM-YYYY ordering', () => {
    expect(parseTimestampAuto('05-11-2023 081530.flac')).toBe(
      '2023-11-05T08:15:30'
    )
  })

  test('missing seconds defaults to 00', () => {
    expect(parseTimestampAuto('20210608_1926.wav')).toBe('2021-06-08T19:26:00')
  })

  test('unparseable → undefined', () => {
    expect(parseTimestampAuto('random-name.wav')).toBeUndefined()
  })
})

describe('parseTimestampUnixHex', () => {
  test('AudioMoth legacy hex name', () => {
    // 0x5A3D64A0 = 1513972896 = 2017-12-22T20:01:36Z
    expect(parseTimestampUnixHex('5A3D64A0.WAV')).toBe(
      '2017-12-22T20:01:36.000Z'
    )
  })

  test('non-hex name → undefined', () => {
    expect(parseTimestampUnixHex('recording1.wav')).toBeUndefined()
  })
})

describe('parseTimestampWithFormat', () => {
  test('explicit %-token format', () => {
    expect(
      parseTimestampWithFormat(
        'REC_2024.03.15-06.45.10.flac',
        '%Y.%M.%D-%H.%I.%S'
      )
    ).toBe('2024-03-15T06:45:10')
  })

  test('12-hour clock with AM/PM', () => {
    expect(
      parseTimestampWithFormat(
        'rec-2024.03.15-07.45PM.flac',
        '%Y.%M.%D-%G.%I%A'
      )
    ).toBe('2024-03-15T19:45:00')
  })

  test('two-digit year expands to 20xx', () => {
    expect(
      parseTimestampWithFormat('24-03-15_064510.wav', '%y-%M-%D_%H%I%S')
    ).toBe('2024-03-15T06:45:10')
  })

  // --- duplicate-token formats ------------------------------------------
  // Token substitution used `String.replace(token, pattern)`, which replaces
  // only the FIRST occurrence. A format reusing a token therefore left a RAW
  // `%X` in the regex, so the pattern could never match and parsing returned
  // undefined with no explanation.
  //
  // The obvious "fix" (a global replace) is WRONG and was measured to throw:
  // every token expands to a NAMED capture group, so emitting it twice yields
  // `SyntaxError: Duplicate capture group name`. Rejecting the format up-front
  // is therefore the only correct behaviour -- and it lets the UI explain the
  // problem instead of silently failing.
  test('duplicate tokens are rejected, not half-substituted', () => {
    expect(isValidTimestampFormat('%Y_%Y')).toBe(false)
    expect(isValidTimestampFormat('%H-%H')).toBe(false)
  })

  test('a duplicate-token format never throws when parsed', () => {
    // Guards the global-replace regression: this must return undefined,
    // NOT raise SyntaxError: Duplicate capture group name.
    expect(() => parseTimestampWithFormat('2024_2024.wav', '%Y_%Y')).not.toThrow()
    expect(parseTimestampWithFormat('2024_2024.wav', '%Y_%Y')).toBeUndefined()
  })

  // Mutation-testing drove this case. The tests above still passed with the
  // guard removed from parseTimestampWithFormat, because a half-substituted
  // pattern usually fails to match anyway (and formatIso independently
  // requires year+month+day+minute, so a partial capture yields undefined).
  // Neither pinned the guard.
  //
  // This input DOES pin it: the format carries a FULL date+time plus a
  // repeated %S. The first %S substitutes, the duplicate stays literal, and a
  // filename containing that literal text satisfies the whole pattern -- so
  // without the guard the parser returns a REAL timestamp derived from a
  // format the user never expressed. Silent wrong data, which is worse than
  // refusing. Measured before writing: groups =
  // {year:2024, month:03, day:15, hour:06, minute:45, second:10}.
  test('an invalid format is REFUSED, never parsed partially', () => {
    expect(
      parseTimestampWithFormat('2024.03.15-06.45.10%S.wav', '%Y.%M.%D-%H.%I.%S%S')
    ).toBeUndefined()
  })

  test('unknown tokens are rejected', () => {
    // %Q is not in FORMAT_TOKENS: it stays literal, so the pattern silently
    // cannot match. Better to reject it and let the UI say why.
    expect(isValidTimestampFormat('%Y-%Q')).toBe(false)
    expect(parseTimestampWithFormat('2024-03.wav', '%Y-%Q')).toBeUndefined()
  })

  test('valid formats still pass validation', () => {
    expect(isValidTimestampFormat('%Y.%M.%D-%H.%I.%S')).toBe(true)
    expect(isValidTimestampFormat('%y-%M-%D_%H%I%S')).toBe(true)
    expect(isValidTimestampFormat('%Y.%M.%D-%G.%I%A')).toBe(true)
  })

  test('a format with no recognised token is invalid', () => {
    // Otherwise the "format" is a literal string that can only ever match
    // itself -- a silent no-op the user would have no way to diagnose.
    expect(isValidTimestampFormat('recording.wav')).toBe(false)
    expect(isValidTimestampFormat('')).toBe(false)
  })

  test('%% is an escaped literal percent, not a token', () => {
    // Desktop parity: a literal % in a filename is written %%. It must not be
    // mistaken for an unknown token, and %%Y is a literal % followed by a
    // year token -- not a duplicate of %Y.
    expect(isValidTimestampFormat('%Y%%')).toBe(true)
  })
})

describe('matchTimestamp — saved formats AUGMENT auto-detect', () => {
  const saved = (format: string, id = 'f1', label = 'Field kit'): { id: string, label: string, format: string } =>
    ({ id, label, format })

  // THE CENTRAL GUARANTEE (operator, 2026-08-18): "adding a format can never
  // break a filename that already parsed".
  //
  // Pinned with a saved format that GENUINELY RIVALS the built-in one on this
  // filename -- it matches, and it yields a DIFFERENT INSTANT (it reads the
  // trailing +0700 as an offset, which the auto patterns deliberately never
  // capture). Measured both sides before asserting. A weaker fixture, where
  // the saved format simply failed to match, would pass even if precedence
  // were flipped and would pin nothing.
  test('a built-in pattern wins over a saved format that also matches', () => {
    const name = '20240315_064510+0700.wav'
    // Both parse this name, to materially different results:
    expect(parseTimestampAuto(name)).toBe('2024-03-15T06:45:10')
    expect(parseTimestampWithFormat(name, '%Y%M%D_%H%I%S%Z')).toBe('2024-03-15T06:45:10+0700')

    const match = matchTimestamp(name, [saved('%Y%M%D_%H%I%S%Z')])
    expect(match?.source).toBe('auto')
    expect(match?.timestamp).toBe('2024-03-15T06:45:10') // the built-in result
    expect(match?.formatId).toBeUndefined()
  })

  test('a saved format catches a name auto-detect cannot', () => {
    // Month-NAME style: no built-in pattern handles it (verified below), which
    // is exactly the gap saved formats exist to fill.
    expect(parseTimestampAuto('KIT_15Mar2024_0645.wav')).toBeUndefined()
    const match = matchTimestamp('KIT_15Mar2024_0645.wav', [saved('KIT_%D%n%Y_%H%I')])
    expect(match?.source).toBe('saved')
    expect(match?.formatId).toBe('f1')
    expect(match?.formatLabel).toBe('Field kit')
    expect(match?.timestamp).toBe('2024-03-15T06:45:00')
  })

  test('first in list wins among saved formats', () => {
    // Both match; they disagree (one reads 15 as the day, the other as the
    // month), so the REPORTED id proves which produced the date -- the
    // shadowing case the staged-row display exists to expose.
    const name = 'KIT_15Mar2024_0645+0700.wav'
    const withZone = saved('KIT_%D%n%Y_%H%I%Z', 'zoned', 'With offset')
    const withoutZone = saved('KIT_%D%n%Y_%H%I', 'naive', 'No offset')

    const zonedFirst = matchTimestamp(name, [withZone, withoutZone])
    expect(zonedFirst?.formatId).toBe('zoned')
    expect(zonedFirst?.timestamp).toBe('2024-03-15T06:45:00+0700')

    const naiveFirst = matchTimestamp(name, [withoutZone, withZone])
    expect(naiveFirst?.formatId).toBe('naive')
    expect(naiveFirst?.timestamp).toBe('2024-03-15T06:45:00')
  })

  test('no formats, or none matching, behaves exactly as auto-detect', () => {
    expect(matchTimestamp('20240315_064510.wav')?.timestamp).toBe(parseTimestampAuto('20240315_064510.wav'))
    expect(matchTimestamp('no-date-here.wav', [saved('%Y%M%D')])).toBeUndefined()
  })

  // MUTATION-DRIVEN. The first version of this test used '%Y_%Y' as the
  // "invalid" entry and SURVIVED the mutation that strips the validity guard
  // -- because that format fails to match with or without the guard, so it
  // pinned nothing. (Same trap the guard's own test hit in the previous
  // session: an invalid format usually fails anyway.)
  //
  // This fixture genuinely defeats the unguarded path. The duplicate %I
  // substitutes once and leaves a literal '%I' in the pattern, which this
  // filename happens to contain -- so WITHOUT the guard the whole pattern
  // matches and yields {day:15, monthName:Mar, year:2024, hour:06, minute:45},
  // i.e. a REAL timestamp derived from a format the user never expressed.
  // Silent wrong data, which is worse than refusing. Measured before writing.
  test('an invalid saved format is REFUSED, never parsed partially', () => {
    expect(matchTimestamp('KIT_15Mar2024_0645%I.wav', [
      saved('KIT_%D%n%Y_%H%I%I', 'bad', 'Broken')
    ])).toBeUndefined()
  })

  test('an invalid saved format is skipped, not fatal to the ones after it', () => {
    // Stored data can predate validation; a bad entry must degrade to the next
    // format rather than throw or block every one after it.
    const match = matchTimestamp('KIT_15Mar2024_0645.wav', [
      saved('%Y_%Y', 'bad', 'Broken'),
      saved('KIT_%D%n%Y_%H%I', 'good', 'Good')
    ])
    expect(match?.formatId).toBe('good')
  })
})

describe('parseTimestamp (dispatcher)', () => {
  test('unix hex format routing', () => {
    expect(parseTimestamp('5A3D64A0.WAV', TIMESTAMP_FORMAT_UNIX_HEX)).toBe(
      '2017-12-22T20:01:36.000Z'
    )
  })
})

describe('toUtcIso', () => {
  test('explicit Z passes through', () => {
    expect(toUtcIso('2021-06-08T19:26:40.000Z')).toBe(
      '2021-06-08T19:26:40.000Z'
    )
  })

  test('naive + no timezone assumes UTC', () => {
    expect(toUtcIso('2021-06-08T19:26:40')).toBe('2021-06-08T19:26:40.000Z')
  })

  test('naive + fixed offset minutes', () => {
    // +420 min = UTC+7 (Bangkok): local 19:26 → 12:26 UTC
    expect(toUtcIso('2021-06-08T19:26:40', 420)).toBe(
      '2021-06-08T12:26:40.000Z'
    )
  })

  test('naive + IANA zone', () => {
    expect(toUtcIso('2021-06-08T19:26:40', 'Asia/Bangkok')).toBe(
      '2021-06-08T12:26:40.000Z'
    )
  })

  test('naive + IANA zone with DST (America/New_York summer = UTC-4)', () => {
    expect(toUtcIso('2021-06-08T19:26:40', 'America/New_York')).toBe(
      '2021-06-08T23:26:40.000Z'
    )
  })

  test('filename-carried offset wins over passed timezone', () => {
    expect(toUtcIso('2021-06-08T19:26:40+0700', 'America/New_York')).toBe(
      '2021-06-08T12:26:40.000Z'
    )
  })
})
