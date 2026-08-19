import { describe, expect, test } from 'vitest'

import { isValidTimestampFormat, matchTimestamp, parseTimestamp, parseTimestampAuto, parseTimestampUnixHex, parseTimestampWithFormat, renderFormatExample, TIMESTAMP_FORMAT_TOKEN_LABELS, TIMESTAMP_FORMAT_UNIX_HEX, TIMESTAMP_TOKEN_GROUPS, toUtcIso } from './timestamp-parser'

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

describe('TIMESTAMP_TOKEN_GROUPS — palette copy must match real behaviour', () => {
  const all = TIMESTAMP_TOKEN_GROUPS.flatMap(group => group.tokens)

  test('covers every token exactly once, and only real tokens', () => {
    const listed = all.map(t => t.token).sort()
    const real = Object.keys(TIMESTAMP_FORMAT_TOKEN_LABELS).sort()
    expect(listed).toEqual(real)
    expect(new Set(listed).size).toBe(listed.length)
  })

  test('every example ACTUALLY parses with its own token', () => {
    // The palette promises "%D matches 05". If an example does not parse inside
    // a minimal complete format, the copy is lying to the user.
    //
    // MEASURED, after two wrong guesses: formatIso requires year, month, day,
    // HOUR and minute before it will return anything. (It early-returns on a
    // missing hour too, which is not obvious from its undefined-check list.)
    // Each case is that full scaffold with the token under test SUBSTITUTED IN
    // PLACE -- an earlier version appended it, which duplicated the field it
    // was replacing. Both failures were the test's fault, not the palette's.
    const scaffold: Array<[string, string]> = [
      ['%Y', '2024'], ['%M', '03'], ['%D', '15'], ['%H', '06'], ['%I', '45']
    ]
    // Which scaffold slot each token replaces (its semantic field).
    const slotOf: Record<string, string> = {
      '%Y': '%Y', '%y': '%Y',
      '%M': '%M', '%m': '%M', '%N': '%M', '%n': '%M',
      '%D': '%D', '%d': '%D',
      '%H': '%H', '%h': '%H',
      '%I': '%I', '%i': '%I'
    }

    for (const { token, example } of all) {
      const slot = slotOf[token]
      // 12-hour tokens replace the 24-hour slot AND need their AM/PM partner,
      // which is why they are handled as a pair rather than a plain swap.
      const pairs = token === '%G' || token === '%g'
        ? scaffold.map(([tok, val]) => tok === '%H' ? [token, example] : [tok, val]).concat([['%A', 'PM']])
        : slot !== undefined
          ? scaffold.map(([tok, val]) => tok === slot ? [token, example] : [tok, val])
          : [...scaffold, [token, example]] // second / AM-PM / zone tokens append
      const format = pairs.map(([tok]) => tok).join('_')
      const filename = pairs.map(([, val]) => val).join('_')
      const result = parseTimestampWithFormat(filename, format)
      expect(result, `${token} example "${example}" should parse (${format} vs ${filename})`).toBeDefined()
    }
  })

  test('the three MEASURED traps are stated correctly', () => {
    const info = (tok: string): { range: string } => all.find(t => t.token === tok) as { range: string }
    // %G/%g reject 12 -- the range text must say so.
    expect(parseTimestampWithFormat('2024_03_15_12_45', '%Y_%M_%D_%G_%I')).toBeUndefined()
    expect(info('%G').range).toContain('not 12')
    expect(info('%g').range).toContain('not 12')
    // %Z is positive-offset only.
    expect(parseTimestampWithFormat('2024_03_15_45_-0500', '%Y_%M_%D_%I_%Z')).toBeUndefined()
    expect(info('%Z').range).toContain('+')
    // %z is uppercase only.
    expect(parseTimestampWithFormat('2024_03_15_45_utc', '%Y_%M_%D_%I_%z')).toBeUndefined()
    expect(info('%z').range.toLowerCase()).toContain('capital')
  })
})

describe('renderFormatExample — the inverse of parseTimestampWithFormat', () => {
  // Fixed local moment: 2024-03-05 08:07:09 local. Deliberately uses
  // single-digit month/day/hour/minute/second so zero-padding is exercised.
  const moment = new Date(2024, 2, 5, 8, 7, 9)

  test('renders the common recorder format', () => {
    expect(renderFormatExample('%Y%M%D_%H%I%S', moment)).toBe('20240305_080709')
  })

  test('renders unpadded and named variants', () => {
    expect(renderFormatExample('%y-%m-%d', moment)).toBe('24-3-5')
    expect(renderFormatExample('%N %n', moment)).toBe('March Mar')
    expect(renderFormatExample('%h:%i:%s', moment)).toBe('8:7:9')
  })

  test('12-hour and AM/PM', () => {
    expect(renderFormatExample('%G%A', moment)).toBe('08AM')
    expect(renderFormatExample('%G%A', new Date(2024, 2, 5, 20, 0, 0))).toBe('08PM')
    expect(renderFormatExample('%a', new Date(2024, 2, 5, 20, 0, 0))).toBe('P')
  })

  test('%% renders a literal percent, and unknown tokens pass through', () => {
    expect(renderFormatExample('100%%_%Y', moment)).toBe('100%_2024')
    // %Q is not a token; leaving it visible is better than silently dropping it.
    expect(renderFormatExample('%Q', moment)).toBe('%Q')
  })

  test('a rendered VALUE is never re-substituted', () => {
    // NOTE: this is a DEFENSIVE property, not a currently-reachable bug. A
    // mutation replacing the single pass with replace-per-token SURVIVED, and
    // enumerating the token set showed why: every token is `%X`, so a rendered
    // value like 'March' contains no `%` and cannot be re-matched. The single
    // pass matters only if a bare-letter token is ever added. Kept, with the
    // claim corrected -- an earlier comment here asserted the naive version
    // would rewrite the 'M' in 'March', which is FALSE.
    expect(renderFormatExample('%N', moment)).toBe('March')
    expect(renderFormatExample('%N%n', moment)).toBe('MarchMar')
  })

  // MUTATION-DRIVEN. Dropping pad2 from %y survived against the 2024 fixture --
  // 24 pads to itself. Enumerating years showed the guard only bites for
  // 2000-2009, where an unpadded '7' would NOT round-trip (the parser's %y
  // matches exactly two digits).
  test('%y zero-pads years 2000-2009', () => {
    const y2007 = new Date(2007, 2, 5, 8, 7, 9)
    expect(renderFormatExample('%y', y2007)).toBe('07')
    expect(renderFormatExample('%y', new Date(2000, 0, 1, 0, 0, 0))).toBe('00')
    // ...and it still round-trips, which is the reason it must pad.
    const rendered = renderFormatExample('%y%M%D_%H%I', y2007)
    expect(rendered).toBe('070305_0807')
    expect(parseTimestampWithFormat(rendered, '%y%M%D_%H%I')).toBe('2007-03-05T08:07:00')
  })

  test('offsets render with the true sign', () => {
    expect(renderFormatExample('%Z', moment, { offsetMinutes: 330 })).toBe('+0530')
    // Negative offsets are shown truthfully even though the PARSER only matches
    // +hhmm -- rendering a fake '+' would hide that real limitation.
    expect(renderFormatExample('%Z', moment, { offsetMinutes: -240 })).toBe('-0400')
    expect(renderFormatExample('%z', moment, { zoneAbbreviation: 'EST' })).toBe('EST')
  })

  // THE LOAD-BEARING TEST: render -> parse must return the moment we started
  // from. This is what ties the example to real parser behaviour, so the two
  // cannot drift apart.
  test('ROUND-TRIP: every rendered example parses back to the same wall time', () => {
    // The parser returns a LOCAL-NAIVE ISO string (no zone), which is exactly
    // what the renderer was given, so compare those directly. An earlier version
    // of this test tried to convert through epoch millis and got the offset
    // arithmetic wrong -- the TEST was broken, not the renderer.
    const formats: Array<[string, string]> = [
      ['%Y%M%D_%H%I%S', '2024-03-05T08:07:09'],
      ['%Y-%M-%D %H:%I:%S', '2024-03-05T08:07:09'],
      ['KIT_%D%n%Y_%H%I', '2024-03-05T08:07:00'], // no seconds token -> 00
      ['%y%M%D%H%I', '2024-03-05T08:07:00'],
      ['%Y%M%D_%G%I%S%A', '2024-03-05T08:07:09']
    ]
    for (const [format, expected] of formats) {
      const rendered = renderFormatExample(format, moment)
      const parsed = parseTimestampWithFormat(rendered, format)
      expect(parsed, `${format} -> ${rendered}`).toBe(expected)
    }
  })

  test('ROUND-TRIP holds for a PM 12-hour format (the %G quirk)', () => {
    // Noon renders as '0' + 'PM' because the parser matches 00-11 and adds 12.
    // Odd-looking, but it MUST round-trip -- that is why it is rendered this way.
    const noon = new Date(2024, 2, 5, 12, 30, 0)
    const rendered = renderFormatExample('%Y%M%D_%G%I%A', noon)
    expect(rendered).toBe('20240305_0030PM')
    const parsed = parseTimestampWithFormat(rendered, '%Y%M%D_%G%I%A')
    expect(parsed).toBe('2024-03-05T12:30:00')
  })
})
