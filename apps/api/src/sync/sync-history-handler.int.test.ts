import { LightMyRequestResponse } from 'fastify'
import { beforeAll, describe, expect, test } from 'vitest'

import { syncHistoryUrl } from '@rfcx-bio/common/api-bio/sync'
import { SourceSync } from '@rfcx-bio/common/dao/types'

import { getMockedFastify } from '@/_testing/get-mocked-fastify'
import { routesSync } from '@/sync'
import { GET } from '~/api-helpers/types'

const ROUTE = '/projects/:projectId/sync-history'

const TEST_PROJECT_ID = '2'

describe(`GET ${ROUTE} (activity dataset)`, () => {
  describe('simple tests', () => {
    test('exists', async () => {
      // Arrange
      const app = await getMockedFastify({ routes: routesSync, isProjectMember: true })

      // Act
      const routes = app.printRoutes()

      // Assert
      expect(routes).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Arrange
      const app = await getMockedFastify({ routes: routesSync, isProjectMember: true })

      // Act
      const response = await app.inject({
        method: GET,
        headers: { authorization: 'BEARER AbCdEf123456' },
        url: syncHistoryUrl({ projectId: TEST_PROJECT_ID })
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = response.json()
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props & no more', async () => {
      // Arrange
      const EXPECTED_PROPS = [
        'syncs'
      ]
      const app = await getMockedFastify({ routes: routesSync, isProjectMember: true })

      // Act
      const response = await app.inject({
        method: GET,
        headers: { authorization: 'BEARER AbCdEf123456' },
        url: syncHistoryUrl({ projectId: TEST_PROJECT_ID })
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
      expect(Object.keys(result).length).toBe(EXPECTED_PROPS.length)
    })
  })

  describe('known data tests', async () => {
    let response: LightMyRequestResponse

    beforeAll(async () => {
      // Arrange & Act once
      const app = await getMockedFastify({ routes: routesSync, isProjectMember: true })

      response = await app.inject({
        method: GET,
        headers: { authorization: 'BEARER AbCdEf123456' },
        url: syncHistoryUrl({ projectId: TEST_PROJECT_ID })
      })
    })

    test('calculates syncs correctly', async () => {
      // Arrange
      const EXPECTED_PROPS = [
        'id',
        'createdAt',
        'updatedAt',
        'hash',
        'projectId',
        'sourceId',
        'changesJson'
      ]

      // Assert
      const result = JSON.parse(response.body)?.syncs
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)

      const resultArray = result as SourceSync[]
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
      const app = await getMockedFastify({ routes: routesSync })

      // Act
      const response = await app.inject({
        method: GET,
        url: syncHistoryUrl({ projectId: TEST_PROJECT_ID })
      })

      // Assert
      expect(response.statusCode).toBe(401)
    })

    test('rejects invalid token with 401', async () => {
      // Arrange
      const app = await getMockedFastify({ routes: routesSync })

      // Act
      const response = await app.inject({
        method: GET,
        headers: { authorization: 'BANANA AbCdEf123456' }, // not BEARER
        url: syncHistoryUrl({ projectId: TEST_PROJECT_ID })
      })

      // Assert
      expect(response.statusCode).toBe(401)
    })

    test('rejects authenticated but unauthorized (non-project member) with 403', async () => {
      // Arrange
      const app = await getMockedFastify({ routes: routesSync })

      // Act
      const response = await app.inject({
        method: GET,
        headers: { authorization: 'BEARER AbCdEf123456' },
        url: syncHistoryUrl({ projectId: TEST_PROJECT_ID })
      })

      // Assert
      expect(response.statusCode).toBe(403)
    })
  })
})
