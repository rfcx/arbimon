import { describe, expect, test } from 'vitest'

import { type FormatSegment, insertIndexForX, insertTokenAt, moveSegment, normalize, parseFormatSegments, removeSegmentAt, segmentsToFormat } from './format-segments'

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
