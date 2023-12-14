import fastifyRoutes from '@fastify/routes'
import fastify, { type FastifyInstance } from 'fastify'
import fastifyAuth0Verify from 'fastify-auth0-verify'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { GET, PATCH } from '~/api-helpers/types'
import { getSequelize } from '~/db'
import { routesUserProfile } from './index'

vi.mock('~/api-core/api-core')

const ROUTE = '/profile'

const fakeToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImE0NTBhMzFkMjEwYTY5N2ZmMDI3NjU0YmZhMWZmMTFlIn0.eyJhdXRoMF91c2VyX2lkIjoidGVzdCJ9.571qutLhQm4Wc6hdhsVCxKm_rh4szTg9Wygz2JVxIItf3M_hNI5ats5W-HoJJjmFsBJ_oOwI1uU_6e4bfaFcrg'
const fakeTokenUserIdAuth0 = 'test'

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyAuth0Verify, { domain: 'unknown.com' })
  await app.register(fastifyRoutes)

  routesUserProfile
    .forEach(route => app.route(route))

  return app
}

const biodiversitySequelize = getSequelize()
const { UserProfile } = ModelRepository.getInstance(biodiversitySequelize)

const defaultUser = {
  id: 1,
  email: 'jake@rake.com',
  idAuth0: fakeTokenUserIdAuth0,
  firstName: 'Jake',
  lastName: 'Rake'
}

beforeEach(async () => {
  await UserProfile.create(defaultUser)
})

afterEach(async () => {
  await UserProfile.destroy({ truncate: true })
})

describe('GET /me/profile', async () => {
  test('can get profile when exists in the db', async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: ROUTE,
      headers: { Authorization: fakeToken }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const result = JSON.parse(response.body)
    expect(result.firstName).toBe(defaultUser.firstName)
    expect(result.lastName).toBe(defaultUser.lastName)
  })

  // TODO: to be fixed by #1363
  test.skip('can get profile when does not exist in the db', async () => {
    // Arrange
    const app = await getMockedApp()
    await UserProfile.destroy({ truncate: true })

    // Act
    const response = await app.inject({
      method: GET,
      url: ROUTE,
      headers: { Authorization: fakeToken }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const result = JSON.parse(response.body)
    expect(result.firstName).toBe('')
    expect(result.lastName).toBe('')
  })
})

describe('PATCH /me/profile', async () => {
  test('can update first name when profile exists in the db', async () => {
    // Arrange
    const app = await getMockedApp()
    const profileUpdates = { firstName: 'Brown' }

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      payload: profileUpdates,
      headers: { Authorization: fakeToken }
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await UserProfile.findByPk(defaultUser.id)
    expect(profile?.firstName).toBe(profileUpdates.firstName)
    expect(profile?.lastName).toBe(defaultUser.lastName)
  })

  test('can update first and last name when profile exists in the db', async () => {
    // Arrange
    const app = await getMockedApp()
    const profileUpdates = { firstName: 'Red', lastName: 'Squirrel' }

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      payload: profileUpdates,
      headers: { Authorization: fakeToken }
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await UserProfile.findByPk(defaultUser.id)
    expect(profile?.firstName).toBe(profileUpdates.firstName)
    expect(profile?.lastName).toBe(profileUpdates.lastName)
  })

  // TODO: to be fixed by #1363
  test.skip('can update first and last name when profile does not exist in the db', async () => {
    // Arrange
    const app = await getMockedApp()
    await UserProfile.destroy({ truncate: true })
    const profileUpdates = { firstName: 'Grey', lastName: 'Squirrel' }

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      payload: profileUpdates,
      headers: { Authorization: fakeToken }
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await UserProfile.findByPk(defaultUser.id)
    expect(profile?.firstName).toBe(profileUpdates.firstName)
    expect(profile?.lastName).toBe(profileUpdates.lastName)
  })
})
