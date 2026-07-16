import { describe, expect, test } from 'vitest'

import { parseTimestamp, parseTimestampAuto, parseTimestampUnixHex, parseTimestampWithFormat, TIMESTAMP_FORMAT_UNIX_HEX, toUtcIso } from './timestamp-parser'

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
