import { describe, expect, test } from 'vitest'

import {
  formatUtcOffsetLabel,
  parseUtcOffsetLabel,
  retimestampToOffset,
  rowOffsetMinutes,
  UTC_OFFSET_OPTIONS,
  zoneOffsetAt
} from './utc-offset'

describe('formatUtcOffsetLabel', () => {
  test('zero is plain UTC, not UTC+0', () => {
    expect(formatUtcOffsetLabel(0)).toBe('UTC')
  })

  test('whole hours drop the minutes', () => {
    expect(formatUtcOffsetLabel(-360)).toBe('UTC-6')
    expect(formatUtcOffsetLabel(120)).toBe('UTC+2')
  })

  test('half/quarter hours keep them', () => {
    expect(formatUtcOffsetLabel(270)).toBe('UTC+4:30')
    expect(formatUtcOffsetLabel(345)).toBe('UTC+5:45')
    expect(formatUtcOffsetLabel(-210)).toBe('UTC-3:30')
  })
})

describe('parseUtcOffsetLabel', () => {
  test('round-trips every option offered in the dropdown', () => {
    // The corrector writes a label and reads it back; a lossy pair here would
    // silently change a user's chosen offset.
    for (const { value, label } of UTC_OFFSET_OPTIONS) {
      expect(parseUtcOffsetLabel(label)).toBe(value)
    }
  })

  test('rejects nonsense', () => {
    expect(parseUtcOffsetLabel('')).toBeUndefined()
    expect(parseUtcOffsetLabel('GMT+1')).toBeUndefined()
    expect(parseUtcOffsetLabel('UTC+')).toBeUndefined()
  })
})

describe('zoneOffsetAt', () => {
  test('fixed-offset zone is stable across the year', () => {
    // Costa Rica has never observed DST.
    expect(zoneOffsetAt('America/Costa_Rica', new Date('2024-01-15T12:00:00Z'))).toBe(-360)
    expect(zoneOffsetAt('America/Costa_Rica', new Date('2024-07-15T12:00:00Z'))).toBe(-360)
  })

  test('🔴 DST zone differs BETWEEN summer and winter — the whole reason this helper exists', () => {
    // Comparing a July recording against an offset resolved in January (what
    // "resolve the site zone now" would do) is a one-hour false discrepancy.
    const winter = zoneOffsetAt('America/New_York', new Date('2024-01-15T12:00:00Z'))
    const summer = zoneOffsetAt('America/New_York', new Date('2024-07-15T12:00:00Z'))
    expect(winter).toBe(-300)
    expect(summer).toBe(-240)
    expect(winter).not.toBe(summer)
  })

  test('half-hour zones resolve exactly', () => {
    expect(zoneOffsetAt('Asia/Kolkata', new Date('2024-07-15T12:00:00Z'))).toBe(330)
    expect(zoneOffsetAt('Asia/Kathmandu', new Date('2024-07-15T12:00:00Z'))).toBe(345)
  })

  test('UTC and unknown zones', () => {
    expect(zoneOffsetAt('UTC', new Date('2024-07-15T12:00:00Z'))).toBe(0)
    expect(zoneOffsetAt('', new Date('2024-07-15T12:00:00Z'))).toBeUndefined()
    expect(zoneOffsetAt('Not/AZone', new Date('2024-07-15T12:00:00Z'))).toBeUndefined()
  })
})

describe('rowOffsetMinutes', () => {
  test('derives the offset from the pair of timestamps', () => {
    // 14:30 local == 20:30Z  =>  UTC-6
    expect(rowOffsetMinutes('2024-03-15T14:30:00', '2024-03-15T20:30:00Z')).toBe(-360)
  })

  test('UTC rows are zero', () => {
    expect(rowOffsetMinutes('2024-03-15T14:30:00', '2024-03-15T14:30:00Z')).toBe(0)
  })

  test('a row with no resolved timestamp has no offset', () => {
    expect(rowOffsetMinutes(undefined, '2024-03-15T20:30:00Z')).toBeUndefined()
    expect(rowOffsetMinutes('2024-03-15T14:30:00', undefined)).toBeUndefined()
    expect(rowOffsetMinutes('nonsense', 'nonsense')).toBeUndefined()
  })
})

describe('retimestampToOffset', () => {
  test('holds the WALL CLOCK constant and moves the instant', () => {
    // The recorder said 14:30. Correcting the zone to UTC-5 must keep 14:30
    // and change the absolute instant to 19:30Z -- NOT relabel the row.
    expect(retimestampToOffset('2024-03-15T14:30:00', -300)).toBe('2024-03-15T19:30:00Z')
    expect(retimestampToOffset('2024-03-15T14:30:00', -360)).toBe('2024-03-15T20:30:00Z')
    expect(retimestampToOffset('2024-03-15T14:30:00', 0)).toBe('2024-03-15T14:30:00Z')
  })

  test('round-trips with rowOffsetMinutes', () => {
    const wall = '2024-03-15T14:30:00'
    for (const { value } of UTC_OFFSET_OPTIONS) {
      const stamp = retimestampToOffset(wall, value)
      expect(rowOffsetMinutes(wall, stamp)).toBe(value)
    }
  })

  test('crossing midnight moves the date, not just the clock', () => {
    // 23:30 at UTC+2 is 21:30Z the SAME day; at UTC-5 it is 04:30Z the NEXT.
    expect(retimestampToOffset('2024-03-15T23:30:00', 120)).toBe('2024-03-15T21:30:00Z')
    expect(retimestampToOffset('2024-03-15T23:30:00', -300)).toBe('2024-03-16T04:30:00Z')
  })

  test('no wall time means nothing to re-anchor', () => {
    expect(retimestampToOffset(undefined, -360)).toBeUndefined()
  })
})

describe('UTC_OFFSET_OPTIONS', () => {
  test('spans the real-world range and is ordered', () => {
    expect(UTC_OFFSET_OPTIONS[0].value).toBe(-720) // UTC-12
    expect(UTC_OFFSET_OPTIONS[UTC_OFFSET_OPTIONS.length - 1].value).toBe(840) // UTC+14
    const values = UTC_OFFSET_OPTIONS.map(o => o.value)
    expect([...values].sort((a, b) => a - b)).toEqual(values)
  })

  test('includes the quarter/half-hour zones people actually use', () => {
    const labels = UTC_OFFSET_OPTIONS.map(o => o.label)
    expect(labels).toContain('UTC+5:30') // India
    expect(labels).toContain('UTC+5:45') // Nepal
    expect(labels).toContain('UTC+12:45') // Chatham
    expect(labels).toContain('UTC')
  })

  test('no duplicates', () => {
    const values = UTC_OFFSET_OPTIONS.map(o => o.value)
    expect(new Set(values).size).toBe(values.length)
  })
})