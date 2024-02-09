import { expect, test } from 'vitest'

import { getIdByRole, rolesGreaterOrEqualTo } from './index'

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
