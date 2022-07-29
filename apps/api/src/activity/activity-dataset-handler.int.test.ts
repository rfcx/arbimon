import fastify, { FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { ActivityOverviewDataBySpecies, ActivityOverviewDetectionDataBySite, ActivityOverviewDetectionDataByTime } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { GET } from '~/api-helpers/types'
import { routesActivity } from './index'

const PROJECT_ID_BASIC = '20001001'

const ROUTE = '/projects/:projectId/activity'
const URL = `/projects/${PROJECT_ID_BASIC}/activity`

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'activityBySite',
  'activityBySpecies',
  'activityByTimeHour',
  'activityByTimeDay',
  'activityByTimeMonth',
  'activityByTimeDate'
]

const isObjectValueNumber = (obj: any): boolean => {
  return Object.values(obj).every(o => typeof o === 'number')
}

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
      MEMBER_PROJECT_CORE_IDS: ['integration2']
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

describe(`GET ${ROUTE} (activity dataset)`, () => {
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
        url: URL,
        query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
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
        url: URL,
        query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
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
        url: URL,
        query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
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
      url: URL,
      query: { dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
    })

    test('calculates isLocationRedacted correctly', async () => {
      const result = JSON.parse(response.body)?.isLocationRedacted
      expect(result).toBeDefined()
      expect(result).toEqual(false)
    })
    test('calculates activityBySite correctly', async () => {
      // Arrange
      const expectedSiteId = [20001001, 20001002]
      const expectedProperties = ['siteId', 'siteName', 'latitude', 'longitude', 'detection', 'detectionFrequency', 'occupancy']

      // Act
      const result = JSON.parse(response.body)?.activityBySite

      // Assert - property exists & correct type
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      const expectedResult = result as ActivityOverviewDetectionDataBySite[]
      expect(expectedResult.length).toBe(2)

      // Assert - get expected site id
      expectedResult.forEach(group => expect(expectedSiteId).includes(group.siteId))

      // Assert - first result contains expected props
      const site = expectedResult[0]
      expectedProperties.forEach(expectedProperty => expect(site).toHaveProperty(expectedProperty))

      // Assert - detection, detection frequency, occupancy are correct
      expect(site.detection).toBe(4)
      expect(site.detectionFrequency).toBeCloseTo(0.013, 2)
      expect(site.occupancy).toBe(true)
    })

    test('calculates activityBySpecies correctly', async () => {
      // Arrange
      const expectedSpecies = ['Accipiter striatus venator', 'Actitis macularius']
      const expectedDetectionCount = [4, 3]
      const expectedProperties = ['commonName', 'scientificName', 'taxon', 'detectionCount', 'detectionFrequency', 'occupiedSites', 'occupancyNaive']

      // Act
      const result = JSON.parse(response.body)?.activityBySpecies

      // Assert - property exists & correct type
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      const expectedResult = result as ActivityOverviewDataBySpecies[]
      expect(expectedResult.length).toBe(2)

      // Assert - first result contains expected props
      const species = expectedResult[0]
      expectedProperties.forEach(expectedProperty => expect(species).toHaveProperty(expectedProperty))

      // Assert - scientific name, detection count, detection frequency are correct
      expectedResult.forEach(item => expect(expectedSpecies).includes(item.scientificName))
      expectedResult.forEach(item => expect(expectedDetectionCount).includes(item.detectionCount))
      expect(species.detectionFrequency).toBeCloseTo(0.003, 2)
    })

    test.todo('check protected species', async () => {
      // TODO
    })

    test('calculates activityByTimeHour correctly', async () => {
      // Arrange
      const expectedDetection = { 10: 4, 12: 2, 15: 1 }
      const expectedDetectionFrequency = {
        10: 0.0036883356385431073,
        12: 0.0018441678192715537,
        15: 0.0009220839096357768
      }
      const expectedProperties = ['detection', 'detectionFrequency']

      // Act
      const activityByTimeHour = JSON.parse(response.body)?.activityByTimeHour

      // Assert - property exists & correct type
      expect(activityByTimeHour).toBeDefined()
      expect(activityByTimeHour).toBeTypeOf('object')
      const expectedResult = activityByTimeHour as ActivityOverviewDetectionDataByTime
      expect(Object.keys(expectedResult).length).toBe(2)

      // Assert - result contains expected props
      expectedProperties.forEach(expectedProperty => expect(activityByTimeHour).toHaveProperty(expectedProperty))

      // Assert - detection, detection frequency are correct
      expect(isObjectValueNumber(activityByTimeHour.detection)).toBeTruthy()
      expect(activityByTimeHour.detection).toEqual(expectedDetection)
      expect(activityByTimeHour.detectionFrequency).toEqual(expectedDetectionFrequency)
    })

    test('calculate activityByTimeDay correctly', async () => {
      // Arrange
      const expectedDetection = { 1: 7 }
      const expectedDetectionFrequency = { 1: 0.006454587367450438 }
      const expectedProperties = ['detection', 'detectionFrequency']

      // Act
      const activityByTimeDay = JSON.parse(response.body)?.activityByTimeDay

      // Assert - property exists & correct type
      expect(activityByTimeDay).toBeDefined()
      expect(activityByTimeDay).toBeTypeOf('object')
      const expectedResult = activityByTimeDay as ActivityOverviewDetectionDataByTime
      expect(Object.keys(expectedResult).length).toBe(2)

      // Assert - result contains expected props
      expectedProperties.forEach(expectedProperty => expect(activityByTimeDay).toHaveProperty(expectedProperty))

      // Assert - detection, detection frequency are correct
      expect(isObjectValueNumber(activityByTimeDay.detection)).toBeTruthy()
      expect(activityByTimeDay.detection).toEqual(expectedDetection)
      expect(activityByTimeDay.detectionFrequency).toEqual(expectedDetectionFrequency)
    })

    test('calculate activityByTimeMonth correctly', async () => {
      // Arrange
      const expectedDetection = { 1: 7 }
      const expectedDetectionFrequency = { 1: 0.006454587367450438 }
      const expectedProperties = ['detection', 'detectionFrequency']

      // Act
      const activityByTimeMonth = JSON.parse(response.body)?.activityByTimeDay

      // Assert - property exists & correct type
      expect(activityByTimeMonth).toBeDefined()
      expect(activityByTimeMonth).toBeTypeOf('object')
      const expectedResult = activityByTimeMonth as ActivityOverviewDetectionDataByTime
      expect(Object.keys(expectedResult).length).toBe(2)

      // Assert - result contains expected props
      expectedProperties.forEach(expectedProperty => expect(activityByTimeMonth).toHaveProperty(expectedProperty))

      // Assert - detection, detection frequency are correct
      expect(isObjectValueNumber(activityByTimeMonth.detection)).toBeTruthy()
      expect(activityByTimeMonth.detection).toEqual(expectedDetection)
      expect(activityByTimeMonth.detectionFrequency).toEqual(expectedDetectionFrequency)
    })

    test('calculate activityByTimeDate correctly', async () => {
      // Arrange
      const expectedDetection = { 19038: 7 }
      const expectedDetectionFrequency = { 19038: 0.006454587367450438 }
      const expectedProperties = ['detection', 'detectionFrequency']

      // Act
      const activityByTimeDate = JSON.parse(response.body)?.activityByTimeDate

      // Assert - property exists & correct type
      expect(activityByTimeDate).toBeDefined()
      expect(activityByTimeDate).toBeTypeOf('object')
      const expectedResult = activityByTimeDate as ActivityOverviewDetectionDataByTime
      expect(Object.keys(expectedResult).length).toBe(2)

      // Assert - result contains expected props
      expectedProperties.forEach(expectedProperty => expect(activityByTimeDate).toHaveProperty(expectedProperty))

      // Assert - detection, detection frequency are correct
      expect(isObjectValueNumber(activityByTimeDate.detection)).toBeTruthy()
      expect(activityByTimeDate.detection).toEqual(expectedDetection)
      expect(activityByTimeDate.detectionFrequency).toEqual(expectedDetectionFrequency)
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
      url: '/projects/1/activity',
      query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
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
        url: '/projects/1/activity'
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
        url: '/projects/x/activity'
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
        url: '/projects/1/activity',
        query: { dateStartInclusiveLocalIso: 'abc', dateEndInclusiveLocalIso: '2021-01-01T00:00:00.000Z' }
      })

      const response2 = await app.inject({
        method: GET,
        url: '/projects/1/activity',
        query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: 'abc' }
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
