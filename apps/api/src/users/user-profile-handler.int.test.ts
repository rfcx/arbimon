import fastifyRoutes from '@fastify/routes'
import fastify, { type FastifyInstance } from 'fastify'
import fastifyAuth0Verify from 'fastify-auth0-verify'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { updateUserProfileToBio } from '@/_middleware/update-user-profile-to-bio-and-core'
import { GET, PATCH } from '~/api-helpers/types'
import { getSequelize } from '~/db'
import { fastifyLruCache } from '../_plugins/global-user-cache'
import { routesUserProfile } from './index'

vi.mock('../_services/api-core/api-core', () => {
  return {
    patchUserProfileOnCore: vi.fn(async () => {
      await Promise.resolve()
    })
  }
})

const ROUTE = '/profile'

const fakeToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZXN0IiwiaWF0IjoxNzAyNTk0NDkyLCJleHAiOjE3MzQxMzA0OTIsImF1ZCI6InVua25vd24uY29tIiwic3ViIjoiYXV0aDB8eHl6IiwiZ2l2ZW5fbmFtZSI6Ikpha2UiLCJmYW1pbHlfbmFtZSI6IlJha2UiLCJlbWFpbCI6Impha2VAcmFrZS5jb20iLCJhdXRoMF91c2VyX2lkIjoiYXV0aDB8eHl6In0.e3V7vOoTEeet5i02PsQYpUtI2buJFv9s9DS1J82cWOk'
const fakeTokenUserIdAuth0 = 'auth0|xyz'

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyAuth0Verify, { domain: 'unknown.com' })
  await app.register(fastifyRoutes)
  await app.register(fastifyLruCache, {
    maxSize: 10,
    maxAge: 10000
  })
  app.addHook('preValidation', updateUserProfileToBio)
  app.addHook('onRequest', (req, _rep, done) => {
    req.extractedUser = null
    done()
  })

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
  await biodiversitySequelize.query('truncate user_profile cascade')
})

describe('GET /profile', async () => {
  test('can get profile when exists in the db', async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: ROUTE,
      headers: { authorization: fakeToken }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const result = JSON.parse(response.body)
    expect(result.firstName).toBe(defaultUser.firstName)
    expect(result.lastName).toBe(defaultUser.lastName)
  })

  test('can get profile when does not exist in the db', async () => {
    // Arrange
    const app = await getMockedApp()
    await biodiversitySequelize.query('truncate user_profile cascade')
    app.lru.clear()

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
})

describe('PATCH /profile', async () => {
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
    const profile = await UserProfile.findOne({ where: { email: defaultUser.email } })
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
    const profile = await UserProfile.findOne({ where: { email: defaultUser.email } })
    expect(profile?.firstName).toBe(profileUpdates.firstName)
    expect(profile?.lastName).toBe(profileUpdates.lastName)
  })

  test('can update first and last name when profile does not exist in the db', async () => {
    // Arrange
    const app = await getMockedApp()
    await biodiversitySequelize.query('truncate user_profile cascade')
    const profileUpdates = { firstName: 'Grey', lastName: 'Squirrel' }
    app.lru.clear()

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      payload: profileUpdates,
      headers: { Authorization: fakeToken }
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await UserProfile.findOne({ where: { email: defaultUser.email } })
    expect(profile?.firstName).toBe(profileUpdates.firstName)
    expect(profile?.lastName).toBe(profileUpdates.lastName)
  })
})
