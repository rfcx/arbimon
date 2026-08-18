import { describe, expect, test } from 'vitest'

import { isValidTimestampFormat, parseTimestamp, parseTimestampAuto, parseTimestampUnixHex, parseTimestampWithFormat, TIMESTAMP_FORMAT_UNIX_HEX, toUtcIso } from './timestamp-parser'

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
