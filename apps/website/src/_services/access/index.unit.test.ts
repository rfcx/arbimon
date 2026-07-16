import { describe, expect, test } from 'vitest'

import { hasFeatureAccess } from './entitlements'

describe('hasFeatureAccess', () => {
  test('grants listed emails (case-insensitive)', () => {
    expect(hasFeatureAccess('analysisJobsTray', 'topher@rfcx.org')).toBe(true)
    expect(hasFeatureAccess('analysisJobsTray', 'Topher@RFCX.org')).toBe(true)
    expect(hasFeatureAccess('analysisJobsTray', 'support@rfcx.org')).toBe(true)
  })

  test('grants super-access identities every feature', () => {
    expect(hasFeatureAccess('analysisJobsTray', 'arbimon-admin@rfcx.org')).toBe(true)
  })

  test('denies unlisted users', () => {
    expect(hasFeatureAccess('analysisJobsTray', 'random@rfcx.org')).toBe(false)
    expect(hasFeatureAccess('analysisJobsTray', 'someone@example.com')).toBe(false)
  })

  test('denies missing/empty email', () => {
    expect(hasFeatureAccess('analysisJobsTray', undefined)).toBe(false)
    expect(hasFeatureAccess('analysisJobsTray', null)).toBe(false)
    expect(hasFeatureAccess('analysisJobsTray', '')).toBe(false)
  })

  test('trims surrounding whitespace', () => {
    expect(hasFeatureAccess('analysisJobsTray', '  topher@rfcx.org  ')).toBe(true)
  })
})
