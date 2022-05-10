import fastify, { FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { activityDatasetGeneratedUrl, ActivityOverviewDetectionDataBySite } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

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
        query: { dateStartUtcInclusive: '2001-01-01T00:00:00.000Z', dateEndUtcInclusive: '2031-01-01T00:00:00.000Z', siteIds: '', taxonClassIds: '' }
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
        query: { dateStartUtcInclusive: '2001-01-01T00:00:00.000Z', dateEndUtcInclusive: '2031-01-01T00:00:00.000Z', siteIds: '', taxonClassIds: '' }
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
        query: { dateStartUtcInclusive: '2001-01-01T00:00:00.000Z', dateEndUtcInclusive: '2031-01-01T00:00:00.000Z' }
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
      query: { dateStartUtcInclusive: '2001-01-01T00:00:00.000Z', dateEndUtcInclusive: '2031-01-01T00:00:00.000Z' }
    })

    test('calculates isLocationRedacted correctly', async () => {
      const result = JSON.parse(response.body)?.isLocationRedacted
      expect(result).toBeDefined()
      expect(result).toEqual(false)
    })

    test('calculates activityBySite correctly', async () => {
      // Arrange
      const knownSiteId = 123
      const expectedProperties = ['siteId', 'siteName', 'latitude', 'longitude', 'detection', 'detectionFrequency', 'occupancy']

      // Act
      const maybeResult = JSON.parse(response.body)?.activityBySite

      // Assert - property exists & correct type
      expect(maybeResult).toBeDefined()
      expect(Array.isArray(maybeResult)).toBe(true)
      const result = maybeResult as ActivityOverviewDetectionDataBySite[]
      expect(result.length).toBe(877)

      // Assert - first result is object
      const maybeKnownSite = result.find(bySite => bySite.siteId === knownSiteId)
      expect(maybeKnownSite).toBeTypeOf('object')
      const knownSite = maybeKnownSite as Record<string, any>

      // Assert - first result contains (only) expected props
      expectedProperties.forEach(expectedProperty => expect(knownSite).toHaveProperty(expectedProperty))
      Object.keys(knownSite).forEach(actualProperty => expect(expectedProperties).toContain(actualProperty))

      // Assert - detection, detection frequency, occupancy are correct
      expect(knownSite.detection).toBe(263)
      expect(knownSite.detectionFrequency).toBeCloseTo(0.27058, 5)
      expect(knownSite.occupancy).toBe(true)
    })

    test.todo('calculates activityBySpecies correctly', async () => {
      const result = JSON.parse(response.body)?.activityBySpecies
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculates activityByTimeHour correctly', async () => {
      const result = JSON.parse(response.body)?.activityByTimeHour
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculate activityByTimeDay correctly', async () => {
      const result = JSON.parse(response.body)?.activityByTimeDay
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculate activityByTimeMonth correctly', async () => {
      const result = JSON.parse(response.body)?.activityByTimeMonth
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculate activityByTimeDate correctly', async () => {
      const result = JSON.parse(response.body)?.activityByTimeDate
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
      query: { dateStartUtcInclusive: '2001-01-01T00:00:00.000Z', dateEndUtcInclusive: '2031-01-01T00:00:00.000Z' }
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
        query: { dateStartUtcInclusive: 'abc', dateEndUtcInclusive: '2021-01-01T00:00:00.000Z' }
      })

      const response2 = await app.inject({
        method: GET,
        url: activityDatasetGeneratedUrl({ projectId: '1' }),
        query: { dateStartUtcInclusive: '2021-01-01T00:00:00.000Z', dateEndUtcInclusive: 'abc' }
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
      expect(errorMessage1).toContain('dateStartUtcInclusive with value')
      expect(errorMessage2).toContain('dateEndUtcInclusive with value')
    })

    test.todo('rejects invalid site ids')

    test.todo('rejects invalid taxon class ids')
  })
})
