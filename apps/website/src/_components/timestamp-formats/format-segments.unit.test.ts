import { describe, expect, test } from 'vitest'

import { type FormatSegment, caretTargetForArrow, insertIndexForX, insertTokenAt, moveSegment, normalize, parseFormatSegments, removeSegmentAt, segmentsToFormat } from './format-segments'

const tokens = (segments: FormatSegment[]): string[] =>
  segments.filter(s => s.kind === 'token').map(s => s.value)

describe('parseFormatSegments / segmentsToFormat', () => {
  test('round-trips a realistic format losslessly', () => {
    const format = 'KIT_%Y%M%D_%H%I%S.wav'
    expect(segmentsToFormat(parseFormatSegments(format))).toBe(format)
  })

  test('splits tokens out of the literal text', () => {
    const segments = parseFormatSegments('KIT_%Y-%M')
    expect(tokens(segments)).toEqual(['%Y', '%M'])
    expect(segments[0]).toEqual({ kind: 'text', value: 'KIT_' })
  })

  test('%% stays TEXT — it is an escaped percent, not a draggable token', () => {
    // Dragging it would imply it can be reordered as a field, which it cannot;
    // it is literal output. Mirrors the engine's own tokenizer rule.
    const segments = parseFormatSegments('100%%_%Y')
    expect(tokens(segments)).toEqual(['%Y'])
    expect(segmentsToFormat(segments)).toBe('100%%_%Y')
  })

  test('round-trips the empty format', () => {
    expect(segmentsToFormat(parseFormatSegments(''))).toBe('')
  })
})

describe('normalize — the alternating invariant', () => {
  test('inserts an empty text slot between adjacent tokens', () => {
    // Without this the user cannot place a caret between two chips, so a
    // separator could never be typed into %Y%M.
    const segments = parseFormatSegments('%Y%M')
    expect(segments.map(s => s.kind)).toEqual(['text', 'token', 'text', 'token', 'text'])
    expect(segmentsToFormat(segments)).toBe('%Y%M') // still lossless
  })

  test('always starts and ends with a text segment', () => {
    for (const format of ['%Y', 'abc', '%Y_%M', '', 'x%Yy']) {
      const segments = parseFormatSegments(format)
      expect(segments[0].kind, format).toBe('text')
      expect(segments[segments.length - 1].kind, format).toBe('text')
    }
  })

  test('merges adjacent text runs', () => {
    const merged = normalize([
      { kind: 'text', value: 'a' },
      { kind: 'text', value: 'b' },
      { kind: 'token', value: '%Y' }
    ])
    expect(merged.filter(s => s.kind === 'text').map(s => s.value)).toEqual(['ab', ''])
  })
})

describe('insertTokenAt', () => {
  test('inserts at the requested position', () => {
    const segments = parseFormatSegments('%Y_%S') // text %Y text %S text
    const next = insertTokenAt(segments, '%M', 3)
    expect(tokens(next)).toEqual(['%Y', '%M', '%S'])
    expect(segmentsToFormat(next)).toBe('%Y_%M%S')
  })

  test('a drop past the end appends instead of throwing', () => {
    const next = insertTokenAt(parseFormatSegments('%Y'), '%M', 999)
    expect(tokens(next)).toEqual(['%Y', '%M'])
  })

  test('a drop before the start prepends', () => {
    const next = insertTokenAt(parseFormatSegments('%Y'), '%M', -5)
    expect(tokens(next)).toEqual(['%M', '%Y'])
  })

  test('inserting into an empty field yields just that token', () => {
    expect(segmentsToFormat(insertTokenAt(parseFormatSegments(''), '%Y', 1))).toBe('%Y')
  })
})

describe('removeSegmentAt', () => {
  test('removes the chip and heals the surrounding text', () => {
    const segments = parseFormatSegments('a%Yb')
    const index = segments.findIndex(s => s.kind === 'token')
    const next = removeSegmentAt(segments, index)
    expect(tokens(next)).toEqual([])
    expect(segmentsToFormat(next)).toBe('ab') // 'a' and 'b' merged, not left split
  })

  test('an out-of-range index is a no-op', () => {
    const segments = parseFormatSegments('%Y')
    expect(segmentsToFormat(removeSegmentAt(segments, 99))).toBe('%Y')
  })
})

describe('moveSegment — reordering inside the field', () => {
  // MUTATION-DRIVEN. The first version of this test moved %Y to index 6 and
  // SURVIVED the mutation that deletes the `toIndex > fromIndex ? toIndex - 1`
  // compensation -- because at index 6 the compensated and naive results are
  // IDENTICAL. Enumerating every (from,to) pair on '%Y_%M_%D' showed the two
  // differ at only three points: 1->3, 1->5 and 3->5, i.e. when the insertion
  // point lands on a LATER TOKEN's slot. Those are the cases that pin it.
  test('moving a chip LATER compensates for its own removal', () => {
    const segments = parseFormatSegments('%Y_%M_%D') // t %Y t %M t %D t
    const from = segments.findIndex(s => s.value === '%Y') // 1

    // Drop %Y onto %M's slot: it should stay put, NOT jump past %M.
    // (Uncompensated this yields %M,%Y,%D.)
    expect(tokens(moveSegment(segments, from, 3))).toEqual(['%Y', '%M', '%D'])

    // Drop %Y onto %D's slot: it lands between %M and %D.
    // (Uncompensated this yields %M,%D,%Y -- one slot too far.)
    expect(tokens(moveSegment(segments, from, 5))).toEqual(['%M', '%Y', '%D'])

    // And dropping %M onto %D's slot is likewise a no-op, not a swap.
    const fromM = segments.findIndex(s => s.value === '%M') // 3
    expect(tokens(moveSegment(segments, fromM, 5))).toEqual(['%Y', '%M', '%D'])

    // Past the end still appends.
    expect(tokens(moveSegment(segments, from, segments.length))).toEqual(['%M', '%D', '%Y'])
  })

  test('moving a chip EARLIER needs no compensation', () => {
    const segments = parseFormatSegments('%Y_%M_%D')
    const from = segments.findIndex(s => s.value === '%D')
    const next = moveSegment(segments, from, 0)
    expect(tokens(next)).toEqual(['%D', '%Y', '%M'])
  })

  test('moving a chip onto itself leaves the order unchanged', () => {
    const segments = parseFormatSegments('%Y_%M')
    const from = segments.findIndex(s => s.value === '%Y')
    expect(tokens(moveSegment(segments, from, from))).toEqual(['%Y', '%M'])
  })

  test('literal text survives a reorder', () => {
    const segments = parseFormatSegments('KIT_%Y-%M.wav')
    const from = segments.findIndex(s => s.value === '%M')
    const next = moveSegment(segments, from, 0)
    expect(segmentsToFormat(next)).toContain('KIT_')
    expect(segmentsToFormat(next)).toContain('.wav')
    expect(tokens(next)).toEqual(['%M', '%Y'])
  })

  test('an out-of-range source is a no-op', () => {
    expect(tokens(moveSegment(parseFormatSegments('%Y'), 42, 0))).toEqual(['%Y'])
  })
})

describe('insertIndexForX — pointer position decides the drop slot', () => {
  const rects = [
    { index: 1, left: 100, width: 40 }, // midpoint 120
    { index: 3, left: 150, width: 40 } // midpoint 170
  ]

  test('left of the first midpoint drops before it', () => {
    expect(insertIndexForX(rects, 105)).toBe(1)
  })

  test('past a midpoint drops after that chip', () => {
    expect(insertIndexForX(rects, 130)).toBe(3)
  })

  test('past every chip appends', () => {
    expect(insertIndexForX(rects, 500)).toBe(4)
  })

  test('an empty field always yields index 0', () => {
    expect(insertIndexForX([], 250)).toBe(0)
  })
})

describe('caretTargetForArrow — a token is ONE character for the caret', () => {
  // 'a%Yb' => [0]text'a'  [1]token'%Y'  [2]text'b'
  const segments = parseFormatSegments('a%Yb')

  test('the fixture has the shape these cases assume', () => {
    expect(segments.map(s => s.kind)).toEqual(['text', 'token', 'text'])
    expect(segments[0].value).toBe('a')
    expect(segments[2].value).toBe('b')
  })

  test('RIGHT at the end of a text run steps OVER the token', () => {
    // Caret after 'a', pressing right: it must not land inside %Y, it lands at
    // the start of 'b' -- one press, one token.
    expect(caretTargetForArrow(segments, 0, 1, 'right')).toEqual({ index: 2, offset: 0 })
  })

  test('LEFT at the start of a text run steps back OVER the token', () => {
    expect(caretTargetForArrow(segments, 2, 0, 'left')).toEqual({ index: 0, offset: 1 })
  })

  // MUTATION-DRIVEN. The original version of this test used segment 0 of
  // 'ab%Y', where the LEFT hop is undefined anyway (there is no token before
  // it) -- so it passed even with the `offset > 0` guard deleted. The guard is
  // only observable from a text segment that HAS a token to its left, with the
  // caret partway through it. Found by enumerating every (segment, offset,
  // direction) triple and diffing real vs mutated.
  test('mid-text movement is left to the browser', () => {
    const longer = parseFormatSegments('ab%Ycd') // [0]'ab' [1]%Y [2]'cd'

    // Caret between c and d: LEFT must move within 'cd', not jump the chip.
    expect(caretTargetForArrow(longer, 2, 1, 'left')).toBeUndefined()
    // ...and at the end of 'cd' likewise.
    expect(caretTargetForArrow(longer, 2, 2, 'left')).toBeUndefined()
    // Caret between a and b: RIGHT must move within 'ab'.
    expect(caretTargetForArrow(longer, 0, 1, 'right')).toBeUndefined()
  })

  test('the ends of the field yield no target (nothing to step onto)', () => {
    expect(caretTargetForArrow(segments, 0, 0, 'left')).toBeUndefined()
    expect(caretTargetForArrow(segments, 2, 1, 'right')).toBeUndefined()
  })

  test('crossing ADJACENT tokens hops one at a time', () => {
    // '%Y%M' => text'' token text'' token text''  -- the empty text slots are
    // what make each token a separate, single step rather than a double jump.
    const adjacent = parseFormatSegments('%Y%M')
    expect(adjacent.map(s => s.kind)).toEqual(['text', 'token', 'text', 'token', 'text'])
    expect(caretTargetForArrow(adjacent, 0, 0, 'right')).toEqual({ index: 2, offset: 0 })
    expect(caretTargetForArrow(adjacent, 2, 0, 'right')).toEqual({ index: 4, offset: 0 })
    expect(caretTargetForArrow(adjacent, 4, 0, 'left')).toEqual({ index: 2, offset: 0 })
    expect(caretTargetForArrow(adjacent, 2, 0, 'left')).toEqual({ index: 0, offset: 0 })
  })

  // MUTATION-DRIVEN. Offset 0 was not enough: with the `kind !== 'text'` check
  // removed, a token segment at offset 0 still returns undefined by accident
  // (offset < value.length is false for a 2-char token only when offset >= 2).
  // The guard is observable at offset >= the token's length.
  test('a caret in a token segment is never asked about', () => {
    // Defensive: the caret cannot be inside a chip, but if asked, decline
    // rather than compute a nonsense target.
    const adjacent = parseFormatSegments('%Y%M') // [1] and [3] are tokens
    expect(caretTargetForArrow(adjacent, 1, 2, 'right')).toBeUndefined()
    expect(caretTargetForArrow(adjacent, 3, 0, 'left')).toBeUndefined()
    expect(caretTargetForArrow(segments, 1, 0, 'right')).toBeUndefined()
  })

  test('a hop lands on a TEXT segment, never on the token itself', () => {
    // Pins the +2 (skip the token) rather than +1 (land on it): a caret cannot
    // live in a chip, so an off-by-one here would put it nowhere.
    const target = caretTargetForArrow(segments, 0, 1, 'right')
    expect(target).toBeDefined()
    expect(segments[(target as { index: number }).index].kind).toBe('text')
  })
})
