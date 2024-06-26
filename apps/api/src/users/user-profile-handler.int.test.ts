import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET, PATCH } from '~/api-helpers/types'
import * as core from '../_services/api-core/api-core'
import { routesUserProfile } from './index'

vi.mock('../_services/api-core/api-core', () => {
  return {
    patchUserProfileOnCore: vi.fn(async () => {
      await Promise.resolve()
    })
  }
})

const ROUTE = '/profile'

const defaultUserToken = {
  email: 'jake@rake.com',
  idAuth0: 'auth0|xyz',
  firstName: 'Jake',
  lastName: 'Rake'
}

const socialUserToken = {
  email: 'somjintana@rfcx.org',
  idAuth0: 'google-oauth2|106691636597425345169',
  firstName: 'Somjintana',
  lastName: 'K'
}

const defaultUserProfile = { id: 1, ...defaultUserToken }
const socialUserProfile = { id: 9001, ...socialUserToken }

const { UserProfile } = modelRepositoryWithElevatedPermissions

beforeEach(async () => {
  await UserProfile.create(defaultUserProfile)
})

afterEach(async () => {
  await UserProfile.destroy({ where: { id: defaultUserProfile.id } })
})

describe('GET /profile', async () => {
  test('can get profile when exists in the db', async () => {
    // Arrange
    const app = await makeApp(routesUserProfile, { userId: defaultUserProfile.id })

    // Act
    const response = await app.inject({
      method: GET,
      url: ROUTE
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const result = JSON.parse(response.body)
    expect(result.firstName).toBe(defaultUserProfile.firstName)
    expect(result.lastName).toBe(defaultUserProfile.lastName)
  })
})

describe('PATCH /profile', async () => {
  test('can update first name when profile exists in the db', async () => {
    // Arrange
    const app = await makeApp(routesUserProfile, { userId: defaultUserProfile.id, userToken: defaultUserToken })
    const profileUpdates = { firstName: 'Brown' }

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      payload: profileUpdates
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await UserProfile.findOne({ where: { email: defaultUserProfile.email } })
    expect(profile?.firstName).toBe(profileUpdates.firstName)
    expect(profile?.lastName).toBe(defaultUserProfile.lastName)
  })

  test('can update first and last name when profile exists in the db', async () => {
    // Arrange
    const app = await makeApp(routesUserProfile, { userId: defaultUserProfile.id, userToken: defaultUserToken })
    const profileUpdates = { firstName: 'Red', lastName: 'Squirrel' }

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      payload: profileUpdates
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await UserProfile.findOne({ where: { email: defaultUserProfile.email } })
    expect(profile?.firstName).toBe(profileUpdates.firstName)
    expect(profile?.lastName).toBe(profileUpdates.lastName)
  })

  test('a new user profile record is not created when email contains uppercase characters', async () => {
    // Arrange
    const app = await makeApp(routesUserProfile, { userId: defaultUserProfile.id, userToken: defaultUserToken })
    const uppercaseEmail = 'JAke@rake.com'
    const profileUpdates = { firstName: 'John', email: uppercaseEmail }

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      payload: profileUpdates
    })

    // Assert
    expect(response.statusCode).toBe(204)

    // No new user profile is created
    const uppercaseProfile = await UserProfile.findOne({ where: { email: uppercaseEmail } })
    expect(uppercaseProfile).toBeNull()

    // The existing user profile is updated
    const existingProfile = await UserProfile.findOne({ where: { email: defaultUserProfile.email } })
    expect(existingProfile).toBeDefined()
    expect(existingProfile?.firstName).toEqual('John')
  })

  test('user with social login doesn\'t update profile on core', async () => {
    // Arrange
    const app = await makeApp(routesUserProfile, { userId: socialUserProfile.id, userToken: socialUserToken })
    const spy = vi.spyOn(core, 'patchUserProfileOnCore')

    const profileUpdates = { email: socialUserToken.email, organizationIdAffiliated: 1 }

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      payload: profileUpdates
    })

    // Assert
    expect(response.statusCode).toBe(204)
    expect(spy).not.toHaveBeenCalled()

    const profile = await UserProfile.findOne({ where: { email: socialUserProfile.email } })
    expect(profile?.organizationIdAffiliated).toBe(1)
  })

  test('user with auth0 login updates profile on core', async () => {
    // Arrange
    const app = await makeApp(routesUserProfile, { userId: defaultUserProfile.id, userToken: defaultUserToken })
    const spy = vi.spyOn(core, 'patchUserProfileOnCore')

    const profileUpdates = { email: defaultUserToken.email, organizationIdAffiliated: 1 }

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      payload: profileUpdates
    })

    // Assert
    expect(response.statusCode).toBe(204)
    expect(spy).toHaveBeenCalled()

    const profile = await UserProfile.findOne({ where: { email: defaultUserProfile.email } })
    expect(profile?.organizationIdAffiliated).toBe(1)
  })
})
