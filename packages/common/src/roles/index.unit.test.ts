import { expect, test } from 'vitest'

import { getIdByRole, getRoleDisplayName, getRoleDisplayNameById, rolesGreaterOrEqualTo } from './index'

test('rolesGreaterOrEqualTo returns roles', () => {
  expect(rolesGreaterOrEqualTo('external')).toEqual(['external', 'viewer', 'entry', 'user', 'expert', 'admin', 'owner'])
  expect(rolesGreaterOrEqualTo('entry')).toEqual(['entry', 'user', 'expert', 'admin', 'owner'])
  expect(rolesGreaterOrEqualTo('expert')).toEqual(['expert', 'admin', 'owner'])
  expect(rolesGreaterOrEqualTo('owner')).toEqual(['owner'])
})

test('getIdByRole returns roles', () => {
  expect(getIdByRole('user')).toBe(2)
  expect(getIdByRole('owner')).toBe(4)
  expect(typeof getIdByRole('owner')).toBe('number')
})

test('getRoleDisplayName maps owner to "Primary Admin" but keeps internal role unchanged', () => {
  expect(getRoleDisplayName('owner')).toBe('Primary Admin')
  expect(getRoleDisplayName('admin')).toBe('Admin')
  expect(getRoleDisplayName('expert')).toBe('Expert')
  expect(getRoleDisplayName('user')).toBe('User')
  expect(getRoleDisplayName('entry')).toBe('Data Entry')
  expect(getRoleDisplayName('viewer')).toBe('Guest')
  expect(getRoleDisplayName('external')).toBe('External')
  expect(getRoleDisplayName('none')).toBe('None')
})

test('getRoleDisplayNameById uses owner role id 4 to display "Primary Admin"', () => {
  expect(getRoleDisplayNameById(4)).toBe('Primary Admin')
  expect(getRoleDisplayNameById(1)).toBe('Admin')
  expect(getRoleDisplayNameById(2)).toBe('User')
  expect(getRoleDisplayNameById(3)).toBe('Guest')
  expect(getRoleDisplayNameById(5)).toBe('Data Entry')
  expect(getRoleDisplayNameById(6)).toBe('Expert')
  expect(getRoleDisplayNameById(999)).toBe('None')
})
