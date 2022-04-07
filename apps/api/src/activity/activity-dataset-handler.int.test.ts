import fastify, { FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { activityDatasetGeneratedUrl } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { GET } from '~/api-helpers/types'
import { routesActivity } from './index'

const ROUTE = '/projects/:projectId/activity'

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'activityBySite',
  'activityBySpecies',
  'activityByTimeHour',
  'activityByTimeDay',
  'activityByTimeMonth',
  'activityByTimeDate'
]

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

  routesActivity
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

const getMockedAppLoggedIn = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  const fakeRequestContext = {
    get: (key: string) => ({
      IS_PROJECT_MEMBER: true,
      MEMBER_PROJECT_CORE_IDS: ['zy5jbxx4cs9f', 'bci392pan298', 'rbj7k70v4na7']
    })[key],
    set: (key: string, value: any) => {}
  }

  app.decorate('requestContext', fakeRequestContext)
  app.decorateRequest('requestContext', fakeRequestContext)

  routesActivity
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

describe('GET /projects/:projectId/activity (activity dataset)', () => {
  describe('simple tests', () => {
    test('exists', async () => {
    // Arrange
    const app = await getMockedAppLoggedOut()

    // Act
    const routes = app.printRoutes()

    // Assert
    expect(routes).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const response = await app.inject({
        method: GET,
        url: activityDatasetGeneratedUrl({ projectId: '1' }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const response = await app.inject({
        method: GET,
        url: activityDatasetGeneratedUrl({ projectId: '1' }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
    })

    test('does not contain any additional props', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const response = await app.inject({
        method: GET,
        url: activityDatasetGeneratedUrl({ projectId: '1' }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    })
  })

  describe('known data tests', async () => {
    // Arrange & Act once
    const app = await getMockedAppLoggedIn()

    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z' }
    })

    test('calculates isLocationRedacted correctly', async () => {
      const result = JSON.parse(response.body)?.isLocationRedacted
      expect(result).toBeDefined()
      expect(result).toEqual(false)
    })

    test('calculates detectionsBySite correctly', async () => {
      // Arrange
      const knownSiteId = '123'
      const expectedProperties = ['siteId', 'siteName', 'latitude', 'longitude', 'detection', 'detectionFrequency', 'occupancy']

      // Act
      const result = JSON.parse(response.body)?.detectionsBySite

      // Assert - property exists
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
      expect(Object.keys(result).length).toBe(877)

      // Assert - first result is object
      const firstResult = result[knownSiteId]
      expect(firstResult).toBeTypeOf('object')

      // Assert - first result contains (only) expected props
      const firstResultAsObject = firstResult as Record<string, any>
      expectedProperties.forEach(expectedProperty => expect(firstResultAsObject).toHaveProperty(expectedProperty))
      Object.keys(firstResultAsObject).forEach(actualProperty => expect(expectedProperties).toContain(actualProperty))

      // Assert - detection, detection frequency, occupancy are correct
      expect(firstResultAsObject.detection).toBe(263)
      expect(firstResultAsObject.detectionFrequency).toBeCloseTo(0.27058, 5)
      expect(firstResultAsObject.occupancy).toBe(true)
    })

    test.todo('calculates detectionsBySpecies correctly', async () => {
      const result = JSON.parse(response.body)?.detectionsBySpecies
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculates detectionsByTimeHour correctly', async () => {
      const result = JSON.parse(response.body)?.detectionsByTimeHour
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculate detectionsByTimeDay correctly', async () => {
      const result = JSON.parse(response.body)?.detectionsByTimeDay
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculate detectionsByTimeMonth correctly', async () => {
      const result = JSON.parse(response.body)?.detectionsByTimeMonth
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculate detectionsByTimeDate correctly', async () => {
      const result = JSON.parse(response.body)?.detectionsByTimeDate
      expect(result).toBeDefined()
      // ...
    })
  })

  describe('known data tests with filtered data', async () => {
    test.todo('detectionsBySite includes all sites from the filter')
    test.todo('detectionsBySite calculates detectionFrequency correctly when a site has 0 detections')
    test.todo('detectionsBySite calculates detectionFrequency correctly when a site has some hours with 0 detections')
  })

  describe('known data tests with redacted data', async () => {
    // Arrange & Act once
    const app = await getMockedAppLoggedOut()

    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z' }
    })

    test('calculates isLocationRedacted correctly', async () => {
      const result = JSON.parse(response.body)?.isLocationRedacted
      expect(result).toBeDefined()
      expect(result).toEqual(true)
    })

    test.todo('redacted species data (is / is not?) included in detectionsBySite')
  })

  describe('client errors', () => {
    test('rejects missing query', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const response = await app.inject({
        method: GET,
        url: activityDatasetGeneratedUrl({ projectId: '1' })
      })

      // Assert
      expect(response.statusCode).toBe(400)
    })

    test('rejects invalid project id', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const response = await app.inject({
        method: GET,
        url: activityDatasetGeneratedUrl({ projectId: 'x' })
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid path params: projectId')
    })

    test('rejects invalid date', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const response1 = await app.inject({
        method: GET,
        url: activityDatasetGeneratedUrl({ projectId: '1' }),
        query: { startDate: 'abc', endDate: '2021-01-01T00:00:00.000Z' }
      })

      const response2 = await app.inject({
        method: GET,
        url: activityDatasetGeneratedUrl({ projectId: '1' }),
        query: { startDate: '2021-01-01T00:00:00.000Z', endDate: 'abc' }
      })

      // Assert
      expect(response1.statusCode).toBe(400)
      expect(response2.statusCode).toBe(400)

      const result1 = JSON.parse(response1.body)
      const result2 = JSON.parse(response2.body)
      const errorMessage1 = result1.message
      const errorMessage2 = result2.message
      expect(errorMessage1).toContain('Invalid query params')
      expect(errorMessage2).toContain('Invalid query params')
      expect(errorMessage1).toContain('startDate with value')
      expect(errorMessage2).toContain('endDate with value')
    })

    test.todo('rejects invalid site ids')

    test.todo('rejects invalid taxons')
  })
})
