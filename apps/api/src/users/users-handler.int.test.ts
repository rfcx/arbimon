import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import { usersRoute } from '@rfcx-bio/common/api-bio/users/profile'
import { type UserTypes } from '@rfcx-bio/node-common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { routesUserProfile } from './index'

vi.mock('../_services/api-core/api-core', () => {
  return {
    patchUserProfileOnCore: vi.fn(async () => {
      await Promise.resolve()
    })
  }
})

const userProfile1 = {
  email: 'thomas@engines.com',
  idAuth0: 'auth0|tec',
  firstName: 'Thomas',
  lastName: 'The Tank Engine'
}
const userProfile2 = {
  email: 'thom@yorke.org',
  idAuth0: 'auth0|ty',
  firstName: 'Thom',
  lastName: 'Yorke'
}

const { UserProfile } = modelRepositoryWithElevatedPermissions

beforeAll(async () => {
  await UserProfile.bulkCreate([userProfile1, userProfile2])
})

afterAll(async () => {
  await UserProfile.destroy({ where: { email: [userProfile1.email, userProfile2.email] } })
})

describe(`GET ${usersRoute}`, async () => {
  test('can filter by email prefix', async () => {
    // Arrange
    const app = await makeApp(routesUserProfile, { userId: 1 })

    // Act
    const response = await app.inject({
      method: GET,
      url: usersRoute,
      query: { q: 'thom' }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const results: Array<UserTypes['light']> = JSON.parse(response.body)
    expect(results).toHaveLength(2)
    const emails = results.map(u => u.email)
    expect(emails).toContain(userProfile1.email)
    expect(emails).toContain(userProfile2.email)
  })

  test('can get exact match', async () => {
    // Arrange
    const app = await makeApp(routesUserProfile, { userId: 1 })

    // Act
    const response = await app.inject({
      method: GET,
      url: usersRoute,
      query: { q: 'thomas@engines.com' }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(results).toHaveLength(1)
    expect(results[0].email).toBe(userProfile1.email)
    expect(results[0].firstName).toBe(userProfile1.firstName)
    expect(results[0].lastName).toBe(userProfile1.lastName)
  })
})
