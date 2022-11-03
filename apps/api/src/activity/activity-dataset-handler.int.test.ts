import fastifyRoutes from '@fastify/routes'
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
  await app.register(fastifyRoutes)

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
  await app.register(fastifyRoutes)

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
      const routes = [...app.routes.keys()]

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
        query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
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
        query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z', siteIds: '', taxonClassIds: '' }
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
      const expectedProperties = ['siteId', 'siteName', 'latitude', 'longitude', 'count', 'detectionFrequency', 'occupancy']

      // Act
      const result = JSON.parse(response.body)?.activityBySite

      // Assert - property exists & correct type
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      const expectedResult = result as ActivityOverviewDetectionDataBySite[]
      expect(expectedResult).toHaveLength(2)

      // Assert - get expected site id
      expectedResult.forEach(group => expect(expectedSiteId).includes(group.siteId))

      // Assert - first result contains expected props
      const site = expectedResult[0]
      expectedProperties.forEach(expectedProperty => expect(site).toHaveProperty(expectedProperty))

      // Assert - detection, detection frequency, occupancy are correct
      expect(site.count).toBe(3)
      expect(site.detectionFrequency).toBeCloseTo(0.428, 2)
    })

    test('calculates activityBySite by specific site correctly', async () => {
      // Arrange
      const expectedSiteId = [20001002]
      const app = await getMockedAppLoggedIn()

      const response = await app.inject({
        method: GET,
        url: URL,
        query: { dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z', siteIds: '20001002' }
      })

      // Act
      const result = JSON.parse(response.body)?.activityBySite

      // Assert - property exists & correct type
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      const expectedResult = result as ActivityOverviewDetectionDataBySite[]
      expect(expectedResult).toHaveLength(1)

      // Assert - get expected site id
      expectedResult.forEach(group => expect(expectedSiteId).includes(group.siteId))

      // Assert - detection, detection frequency, occupancy are correct
      const site = expectedResult[0]
      expect(site.count).toBe(3)
      expect(site.detectionFrequency).toBeCloseTo(0.230, 2)
    })

    test('calculates activityBySpecies correctly', async () => {
      // Arrange
      const expectedSpecies = ['Felis catus', 'Naja']
      const expectedDetectionCount = [4, 2]
      const expectedProperties = ['commonName', 'scientificName', 'taxon', 'detectionMinutesCount', 'detectionFrequency', 'occupiedSites', 'occupancyNaive']

      // Act
      const result = JSON.parse(response.body)?.activityBySpecies

      // Assert - property exists & correct type
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      const expectedResult = result as ActivityOverviewDataBySpecies[]
      expect(expectedResult).toHaveLength(2)

      // Assert - first result contains expected props
      const species = expectedResult[0]
      expectedProperties.forEach(expectedProperty => expect(species).toHaveProperty(expectedProperty))

      // Assert - scientific name, detection count, detection frequency are correct
      expectedResult.forEach(item => expect(expectedSpecies).includes(item.scientificName))
      expectedResult.forEach(item => expect(expectedDetectionCount).includes(item.detectionMinutesCount))
      expect(species.detectionFrequency).toBe(0.2)
    })

    test('calculates activityBySpecies by specific species correctly', async () => {
      // Arrange
      const expected: ActivityOverviewDataBySpecies = {
        commonName: '',
        scientificName: 'Felis catus',
        taxon: 'Mammals',
        detectionMinutesCount: 4,
        detectionFrequency: 0.2,
        occupiedSites: 2,
        occupancyNaive: 1
      }
      const app = await getMockedAppLoggedIn()

      const response = await app.inject({
        method: GET,
        url: URL,
        query: { dateStartInclusiveLocalIso: '2022-01-02T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-02T00:00:00.000Z', taxonClassIds: '600' }
      })

      // Act
      const result = JSON.parse(response.body)?.activityBySpecies

      // Assert - property exists & correct type
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      const expectedResult = result as ActivityOverviewDataBySpecies[]
      expect(expectedResult).toHaveLength(1)

      // Assert - activityBySpecies is correct
      expect(expectedResult[0]).toEqual(expected)
    })

    test('filters by site and taxon work correctly', async () => {
      // Arrange
      const activityBySite: ActivityOverviewDetectionDataBySite = {
        siteId: 20001001,
        siteName: 'Test Site',
        latitude: 18.31307,
        longitude: -65.24878,
        count: 1,
        detectionFrequency: 0.14285714285714285
      }

      const activityBySpecies: ActivityOverviewDataBySpecies = {
        commonName: '',
        scientificName: 'Naja',
        taxon: 'Amphibians',
        detectionMinutesCount: 1,
        detectionFrequency: 0.14285714285714285,
        occupiedSites: 1,
        occupancyNaive: 1
      }

      const app = await getMockedAppLoggedIn()

      const response = await app.inject({
        method: GET,
        url: URL,
        query: { dateStartInclusiveLocalIso: '2022-01-02T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-02T00:00:00.000Z', siteIds: '20001001', taxonClassIds: '100' }
      })

      // Act
      const result = JSON.parse(response.body)

      // Assert - property exists & correct type
      expect(result).toBeDefined()
      const expectedSite = result.activityBySite as ActivityOverviewDetectionDataBySite[]
      const expectedSpecies = result.activityBySpecies as ActivityOverviewDataBySpecies[]
      expect(Array.isArray(expectedSite)).toBe(true)
      expect(Array.isArray(expectedSpecies)).toBe(true)
      expect(expectedSite).toHaveLength(1)
      expect(expectedSpecies).toHaveLength(1)

      // Assert - activityBySite is correct
      expect(expectedSite[0]).toEqual(activityBySite)

      // Assert - activityBySpecies is correct
      expect(expectedSpecies[0]).toEqual(activityBySpecies)
    })

    test('check protected species', async () => {
      // TODO
    })

    test('calculates activityByTimeHour correctly', async () => {
      // Arrange
      const expectedDetection = { 10: 2, 12: 2, 15: 2 }
      const expectedDetectionFrequency = { 10: 0.1, 12: 0.1, 15: 0.1 }
      const expectedProperties = ['detection', 'detectionFrequency']

      // Act
      const activityByTimeHour = JSON.parse(response.body)?.activityByTimeHour

      // Assert - property exists & correct type
      expect(activityByTimeHour).toBeDefined()
      expect(activityByTimeHour).toBeTypeOf('object')
      const expectedResult = activityByTimeHour as ActivityOverviewDetectionDataByTime
      expect(Object.keys(expectedResult)).toHaveLength(2)

      // Assert - result contains expected props
      expectedProperties.forEach(expectedProperty => expect(activityByTimeHour).toHaveProperty(expectedProperty))

      // Assert - detection, detection frequency are correct
      expect(isObjectValueNumber(activityByTimeHour.detection)).toBeTruthy()
      expect(activityByTimeHour.detection).toEqual(expectedDetection)
      expect(activityByTimeHour.detectionFrequency).toEqual(expectedDetectionFrequency)
    })

    test('calculate activityByTimeDay correctly', async () => {
      // Arrange
      const expectedDetection = { 1: 5, 3: 1 }
      const expectedDetectionFrequency = { 1: 0.25, 3: 0.05 }
      const expectedProperties = ['detection', 'detectionFrequency']

      // Act
      const activityByTimeDay = JSON.parse(response.body)?.activityByTimeDay

      // Assert - property exists & correct type
      expect(activityByTimeDay).toBeDefined()
      expect(activityByTimeDay).toBeTypeOf('object')
      const expectedResult = activityByTimeDay as ActivityOverviewDetectionDataByTime
      expect(Object.keys(expectedResult)).toHaveLength(2)

      // Assert - result contains expected props
      expectedProperties.forEach(expectedProperty => expect(activityByTimeDay).toHaveProperty(expectedProperty))

      // Assert - detection, detection frequency are correct
      expect(isObjectValueNumber(activityByTimeDay.detection)).toBeTruthy()
      expect(activityByTimeDay.detection).toEqual(expectedDetection)
      expect(activityByTimeDay.detectionFrequency).toEqual(expectedDetectionFrequency)
    })

    test('calculate activityByTimeMonth correctly', async () => {
      // Arrange
      const expectedDetection = { 1: 5, 3: 1 }
      const expectedDetectionFrequency = { 1: 0.25, 3: 0.05 }
      const expectedProperties = ['detection', 'detectionFrequency']

      // Act
      const activityByTimeMonth = JSON.parse(response.body)?.activityByTimeDay

      // Assert - property exists & correct type
      expect(activityByTimeMonth).toBeDefined()
      expect(activityByTimeMonth).toBeTypeOf('object')
      const expectedResult = activityByTimeMonth as ActivityOverviewDetectionDataByTime
      expect(Object.keys(expectedResult)).toHaveLength(2)

      // Assert - result contains expected props
      expectedProperties.forEach(expectedProperty => expect(activityByTimeMonth).toHaveProperty(expectedProperty))

      // Assert - detection, detection frequency are correct
      expect(isObjectValueNumber(activityByTimeMonth.detection)).toBeTruthy()
      expect(activityByTimeMonth.detection).toEqual(expectedDetection)
      expect(activityByTimeMonth.detectionFrequency).toEqual(expectedDetectionFrequency)
    })

    test('calculate activityByTimeDate correctly', async () => {
      // Arrange
      const expectedDetection = { 19038: 5, 19040: 1 }
      const expectedDetectionFrequency = { 19038: 0.25, 19040: 0.05 }
      const expectedProperties = ['detection', 'detectionFrequency']

      // Act
      const activityByTimeDate = JSON.parse(response.body)?.activityByTimeDate

      // Assert - property exists & correct type
      expect(activityByTimeDate).toBeDefined()
      expect(activityByTimeDate).toBeTypeOf('object')
      const expectedResult = activityByTimeDate as ActivityOverviewDetectionDataByTime
      expect(Object.keys(expectedResult)).toHaveLength(2)

      // Assert - result contains expected props
      expectedProperties.forEach(expectedProperty => expect(activityByTimeDate).toHaveProperty(expectedProperty))

      // Assert - detection, detection frequency are correct
      expect(isObjectValueNumber(activityByTimeDate.detection)).toBeTruthy()
      expect(activityByTimeDate.detection).toEqual(expectedDetection)
      expect(activityByTimeDate.detectionFrequency).toEqual(expectedDetectionFrequency)
    })
  })

  describe('known data tests with filtered data', async () => {
    test('detectionsBySite includes all sites from the filter')
    test('detectionsBySite calculates detectionFrequency correctly when a site has 0 detections')
    test('detectionsBySite calculates detectionFrequency correctly when a site has some hours with 0 detections')
  })

  describe('known data tests with redacted data', async () => {
    // Arrange & Act once
    const app = await getMockedAppLoggedOut()

    const response = await app.inject({
      method: GET,
      url: URL,
      query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
    })

    test('calculates isLocationRedacted correctly', async () => {
      const result = JSON.parse(response.body)?.isLocationRedacted
      expect(result).toBeDefined()
      expect(result).toEqual(true)
    })

    // test('redacted species data (is / is not?) included in detectionsBySite')
  })

  describe('client errors', () => {
    test('rejects missing query', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL
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
        url: URL,
        query: { dateStartInclusiveLocalIso: 'abc', dateEndInclusiveLocalIso: '2021-01-01T00:00:00.000Z' }
      })

      const response2 = await app.inject({
        method: GET,
        url: URL,
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

    test('rejects invalid site ids')

    test('rejects invalid taxons')
  })
})
