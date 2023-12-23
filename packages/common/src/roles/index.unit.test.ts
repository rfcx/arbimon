import { expect, test } from 'vitest'

import { rolesGreaterOrEqualTo } from './index'

test('atLeast returns roles', () => {
  expect(rolesGreaterOrEqualTo('guest')).toEqual(['guest', 'entry', 'user', 'expert', 'admin', 'owner'])
  expect(rolesGreaterOrEqualTo('entry')).toEqual(['entry', 'user', 'expert', 'admin', 'owner'])
  expect(rolesGreaterOrEqualTo('expert')).toEqual(['expert', 'admin', 'owner'])
  expect(rolesGreaterOrEqualTo('owner')).toEqual(['owner'])
})
