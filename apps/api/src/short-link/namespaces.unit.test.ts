import { expect, test } from 'vitest'

import { getBuiltNamespace, isValidNamespaceSegment, NAMESPACES } from './namespaces'

test('namespace segments must be exactly two lowercase letters', () => {
  expect(isValidNamespaceSegment('dl')).toBe(true)
  expect(isValidNamespaceSegment('go')).toBe(true)
  expect(isValidNamespaceSegment('d')).toBe(false) // too short
  expect(isValidNamespaceSegment('dln')).toBe(false) // too long
  expect(isValidNamespaceSegment('DL')).toBe(false) // uppercase
  expect(isValidNamespaceSegment('d1')).toBe(false) // digit
  expect(isValidNamespaceSegment('')).toBe(false)
})

test('dl (download) is the only built namespace in v1', () => {
  expect(getBuiltNamespace('dl')).toBeDefined()
  expect(getBuiltNamespace('dl')?.kind).toBe('download')
  // reserved-but-not-built keys resolve to undefined
  for (const key of ['go', 'pr', 'ac', 'ap', 'im', 'sh', 'qr']) {
    expect(NAMESPACES[key]?.built).toBe(false)
    expect(getBuiltNamespace(key)).toBeUndefined()
  }
})

test('unknown namespace is not built', () => {
  expect(getBuiltNamespace('zz')).toBeUndefined()
  expect(getBuiltNamespace('xx')).toBeUndefined()
})

test('registry keys all match the 2-letter contract', () => {
  for (const key of Object.keys(NAMESPACES)) {
    expect(isValidNamespaceSegment(key)).toBe(true)
    expect(NAMESPACES[key].key).toBe(key)
  }
})
