import { LightMyRequestResponse } from 'fastify'
import { beforeAll, describe, expect, test } from 'vitest'

import { syncHistoryUrl } from '@rfcx-bio/common/api-bio/sync'

import { getInjectAsInvalidToken, getInjectAsLoggedInNotProjectMember, getInjectAsLoggedInProjectMember, getInjectAsLoggedOut, getMockedFastify } from '@/_testing/get-inject'
import { routesSync } from '@/sync'
import { GET } from '~/api-helpers/types'

const ROUTE = '/projects/:projectId/sync-history'

const EXPECTED_PROPS = [
  'syncs'
]

const TEST_PROJECT_ID = '2'

describe(`GET ${ROUTE}`, async () => {
  const routes = routesSync
  const injectAsLoggedInProjectMember = await getInjectAsLoggedInProjectMember(routes)
  const injectAsLoggedInNotProjectMember = await getInjectAsLoggedInNotProjectMember(routes)
  const injectAsLoggedOut = await getInjectAsLoggedOut(routes)
  const injectAsInvalidToken = await getInjectAsInvalidToken(routes)

  describe('simple tests', () => {
    test('exists', async () => {
      // Arrange
      const app = await getMockedFastify({ routes })

      // Act
      const routeList = app.printRoutes()

      // Assert
      expect(routeList).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: syncHistoryUrl({ projectId: TEST_PROJECT_ID })
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = response.json()
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props & no more', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
        method: GET,
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
      response = await injectAsLoggedInProjectMember({
        method: GET,
        url: syncHistoryUrl({ projectId: TEST_PROJECT_ID })
      })
    })

    test('calculates syncs correctly', async () => {
      // Arrange
      const syncExpectedProperties = [
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
      syncExpectedProperties.forEach(expectedProp => expect(knownSync).toHaveProperty(expectedProp))
      expect(Object.keys(knownSync).length).toBe(syncExpectedProperties.length)
    })
  })

  describe('client errors', () => {
    test('rejects missing token with 401', async () => {
      // Act
      const response = await injectAsLoggedOut({
        method: GET,
        url: syncHistoryUrl({ projectId: TEST_PROJECT_ID })
      })

      // Assert
      expect(response.statusCode).toBe(401)
    })

    test('rejects invalid token with 401', async () => {
      // Act
      const response = await injectAsInvalidToken({
        method: GET,
        url: syncHistoryUrl({ projectId: TEST_PROJECT_ID })
      })

      // Assert
      expect(response.statusCode).toBe(401)
    })

    test('rejects authenticated but unauthorized (non-project member) with 403', async () => {
      // Act
      const response = await injectAsLoggedInNotProjectMember({
        method: GET,
        url: syncHistoryUrl({ projectId: TEST_PROJECT_ID })
      })

      // Assert
      expect(response.statusCode).toBe(403)
    })
  })
})
