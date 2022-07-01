import fastify, { FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { DataSource } from '@rfcx-bio/common/dao/types'

import { routesSync } from '@/sync'
import { GET } from '~/api-helpers/types'

const ROUTE = '/projects/:projectId/sync-history'

const PROJECT_ID_WITH_ACCESS = '1'
const PROJECT_ID_NO_ACCESS = '2'
const CORE_ID_OF_PROJECT_WITH_ACCESS = 'zy5jbxx4cs9f'

// TODO: Extract `getMockedApp...`
const getMockedAppLoggedOut = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  const fakeRequestContext = {
    get: (key: string) => ({
      IS_PROJECT_MEMBER: false,
      MEMBER_PROJECT_CORE_IDS: []
    })[key],
    set: (key: string, value: any) => {}
  }

  app.decorate('requestContext', fakeRequestContext)
  app.decorateRequest('requestContext', fakeRequestContext)

  routesSync
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

const getMockedAppLoggedIn = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  const fakeRequestContext = {
    get: (key: string) => ({
      IS_PROJECT_MEMBER: true,
      MEMBER_PROJECT_CORE_IDS: [CORE_ID_OF_PROJECT_WITH_ACCESS]
    })[key],
    set: (key: string, value: any) => {}
  }

  app.decorate('requestContext', fakeRequestContext)
  app.decorateRequest('requestContext', fakeRequestContext)

  routesSync
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

const getMockedAppLoggedInAndNoAccess = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  const fakeRequestContext = {
    get: (key: string) => ({
      IS_PROJECT_MEMBER: false,
      MEMBER_PROJECT_CORE_IDS: [CORE_ID_OF_PROJECT_WITH_ACCESS]
    })[key],
    set: (key: string, value: any) => {}
  }

  app.decorate('requestContext', fakeRequestContext)
  app.decorateRequest('requestContext', fakeRequestContext)

  routesSync
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

describe(`GET ${ROUTE} (activity dataset)`, () => {
  describe('simple tests', () => {
    test('exists', async () => {
    // Arrange
    const app = await getMockedAppLoggedIn()

    // Act
    const routes = app.printRoutes()

    // Assert
    expect(routes).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Arrange
      const app = await getMockedAppLoggedIn()

      // Act
      const response = await app.inject({
        method: GET,
        headers: { authorization: 'BEARER AbCdEf123456' },
        url: `/projects/${PROJECT_ID_WITH_ACCESS}/sync-history`
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props & no more', async () => {
      // Arrange
      const EXPECTED_PROPS = [
        'syncs'
      ]
      const app = await getMockedAppLoggedIn()

      // Act
      const response = await app.inject({
        method: GET,
        headers: { authorization: 'BEARER AbCdEf123456' },
        url: `/projects/${PROJECT_ID_WITH_ACCESS}/sync-history`
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
      expect(Object.keys(result).length).toBe(EXPECTED_PROPS.length)
    })
  })

  describe('known data tests', async () => {
    // Arrange & Act once
    const app = await getMockedAppLoggedIn()

    const response = await app.inject({
      method: GET,
      headers: { authorization: 'BEARER AbCdEf123456' },
      url: `/projects/${PROJECT_ID_WITH_ACCESS}/sync-history`
    })

    test('calculates syncs correctly', async () => {
      // Arrange
      const EXPECTED_PROPS = [
        'createdAt',
        'id',
        'summaryText',
        'updatedAt'
      ]

      // Assert
      const result = JSON.parse(response.body)?.syncs
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)

      const resultArray = result as DataSource[]
      expect(resultArray.length).toEqual(1)

      const knownSync = resultArray[0]
      expect(knownSync).toBeTypeOf('object')
      EXPECTED_PROPS.forEach(expectedProp => expect(knownSync).toHaveProperty(expectedProp))
      expect(Object.keys(knownSync).length).toBe(EXPECTED_PROPS.length)
    })
  })

  describe('client errors', () => {
    test('rejects missing token with 401', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${PROJECT_ID_NO_ACCESS}/sync-history`
      })

      // Assert
      expect(response.statusCode).toBe(401)
    })

    test('rejects invalid token with 401', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const response = await app.inject({
        method: GET,
        headers: { authorization: 'BANANA AbCdEf123456' }, // not BEARER
        url: `/projects/${PROJECT_ID_NO_ACCESS}/sync-history`
      })

      // Assert
      expect(response.statusCode).toBe(401)
    })

    test('rejects authenticated but unauthorized (non-project member) with 403', async () => {
      // Arrange
      const app = await getMockedAppLoggedInAndNoAccess()

      // Act
      const response = await app.inject({
        method: GET,
        headers: { authorization: 'BEARER AbCdEf123456' },
        url: `/projects/${PROJECT_ID_NO_ACCESS}/sync-history`
      })

      // Assert
      expect(response.statusCode).toBe(403)
    })
  })
})
