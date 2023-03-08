import { fastifyRequestContextPlugin } from '@fastify/request-context'
import fastifyRoutes from '@fastify/routes'
import fastify, { type FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { type SpotlightDetectionDataBySite, type SpotlightDetectionDataByTime } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

import { GET } from '~/api-helpers/types'
import { routesSpotlight } from './index'

const PROJECT_ID_BASIC = '30001001'
const SITE_ID_1 = '30001001'

const ROUTE = '/projects/:projectId/spotlight'
const URL = `/projects/${PROJECT_ID_BASIC}/spotlight`

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'totalSiteCount',
  'recordedMinutesCount',
  'detectionMinutesCount',
  'detectionFrequency',
  'occupiedSiteCount',
  'occupiedSiteFrequency',
  'detectionsByLocationSite',
  'detectionsByTimeHour',
  'detectionsByTimeDay',
  'detectionsByTimeMonth',
  'detectionsByTimeYear',
  'detectionsByTimeDate',
  'detectionsByTimeMonthYear'
]

const DETECTION_BY_SITE_DATA_EXPECTED_PROPS = [
  'siteId',
  'siteName',
  'latitude',
  'longitude',
  'siteDetectionMinutesCount',
  'siteDetectionFrequency',
  'siteOccupied'
]

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyRoutes)
  await app.register(fastifyRequestContextPlugin)

  routesSpotlight
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

describe(`GET ${ROUTE} (spotlight dataset)`, () => {
  describe('simple tests', () => {
    test('exists', async () => {
     // Arrange
     const app = await getMockedApp()

     // Act
     const routes = [...app.routes.keys()]

     // Assert
     expect(routes).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert

      expect(response.statusCode).toBe(200)

      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => { expect(result).toHaveProperty(expectedProp) })
    })

    test('does not contain any additional props', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => { expect(EXPECTED_PROPS).toContain(actualProp) })
    })

    test('detectionByLocationSite contain all expected props', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)?.detectionsByLocationSite

      const actualProps = Object.values(result)[0]
      DETECTION_BY_SITE_DATA_EXPECTED_PROPS.forEach(expectedProp => { expect(actualProps).toHaveProperty(expectedProp) })
    })

    test('detectionByLocationSite does not contain any additional props', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)?.detectionsByLocationSite

      const actualProps = Object.values(result)[0] as SpotlightDetectionDataBySite
      Object.keys(actualProps).forEach(actualProp => { expect(DETECTION_BY_SITE_DATA_EXPECTED_PROPS).toContain(actualProp) })
    })

    test('calculate correct total site count, recording count, detection count, detection frequency, occupied site count, and occupied site frequency', async () => {
      // Arrange
      const app = await getMockedApp()
      const expected = {
        totalSiteCount: 2,
        recordedMinutesCount: 20,
        detectionMinutesCount: 4,
        detectionFrequency: 0.2,
        occupiedSiteCount: 2,
        occupiedSiteFrequency: 1
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)

      expect(result).toBeDefined()
      expect(result.totalSiteCount).toBe(expected.totalSiteCount)
      expect(result.recordedMinutesCount).toBe(expected.recordedMinutesCount)
      expect(result.detectionMinutesCount).toBe(expected.detectionMinutesCount)
      expect(result.detectionFrequency).toBe(expected.detectionFrequency)
      expect(result.occupiedSiteCount).toBe(expected.occupiedSiteCount)
      expect(result.occupiedSiteFrequency).toBe(expected.occupiedSiteFrequency)
    })

    test('calculate correct detection count, detection frequency, and naive occupancy by site', async () => {
      // Arrange
      const app = await getMockedApp()
      const expected = {
        totalSiteCount: 1,
        recordedMinutesCount: 7,
        detectionMinutesCount: 2,
        detectionFrequency: 0.2857142857142857,
        occupiedSiteCount: 1,
        occupiedSiteFrequency: 1
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z', siteIds: SITE_ID_1 }
      })

      // Assert
      const result = JSON.parse(response.body)

      expect(result).toBeDefined()
      expect(result.totalSiteCount).toBe(expected.totalSiteCount)
      expect(result.recordedMinutesCount).toBe(expected.recordedMinutesCount)
      expect(result.detectionMinutesCount).toBe(expected.detectionMinutesCount)
      expect(result.detectionFrequency).toBe(expected.detectionFrequency)
      expect(result.occupiedSiteCount).toBe(expected.occupiedSiteCount)
      expect(result.occupiedSiteFrequency).toBe(expected.occupiedSiteFrequency)
    })

    test('calculate correct detection count, detection frequency, and naive occupancy by taxon and correct species id', async () => {
      // Arrange
      const app = await getMockedApp()
      const expected = {
        totalSiteCount: 2,
        recordedMinutesCount: 20,
        detectionMinutesCount: 2,
        detectionFrequency: 0.1,
        occupiedSiteCount: 2,
        occupiedSiteFrequency: 1
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100002', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z', taxonClassIds: '100' }
      })

      // Assert
      const result = JSON.parse(response.body)

      expect(result).toBeDefined()
      expect(result.totalSiteCount).toBe(expected.totalSiteCount)
      expect(result.recordedMinutesCount).toBe(expected.recordedMinutesCount)
      expect(result.detectionMinutesCount).toBe(expected.detectionMinutesCount)
      expect(result.detectionFrequency).toBe(expected.detectionFrequency)
      expect(result.occupiedSiteCount).toBe(expected.occupiedSiteCount)
      expect(result.occupiedSiteFrequency).toBe(expected.occupiedSiteFrequency)
    })

    test('calculate empty detection count, detection frequency, and naive occupancy by taxon and species id on empty date', async () => {
      // Arrange
      const app = await getMockedApp()
      const expected = {
        totalSiteCount: 0,
        recordedMinutesCount: 0,
        detectionMinutesCount: 0,
        detectionFrequency: 0,
        occupiedSiteCount: 0,
        occupiedSiteFrequency: 0
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2021-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2022-01-01T00:00:00.000Z', taxonClassIds: '100' }
      })

      // Assert
      const result = JSON.parse(response.body)

      expect(result).toBeDefined()
      expect(result.totalSiteCount).toBe(expected.totalSiteCount)
      expect(result.recordedMinutesCount).toBe(expected.recordedMinutesCount)
      expect(result.detectionMinutesCount).toBe(expected.detectionMinutesCount)
      expect(result.detectionFrequency).toBe(expected.detectionFrequency)
      expect(result.occupiedSiteCount).toBe(expected.occupiedSiteCount)
      expect(result.occupiedSiteFrequency).toBe(expected.occupiedSiteFrequency)
    })

    test('calculate empty detection count, detection frequency, and naive occupancy by taxon and not correct species id', async () => {
      // Arrange
      const app = await getMockedApp()
      const expected = {
        totalSiteCount: 2,
        recordedMinutesCount: 20,
        detectionMinutesCount: 0,
        detectionFrequency: 0,
        occupiedSiteCount: 0,
        occupiedSiteFrequency: 0
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z', taxonClassIds: '100' }
      })

      // Assert
      const result = JSON.parse(response.body)

      expect(result).toBeDefined()
      expect(result.totalSiteCount).toBe(expected.totalSiteCount)
      expect(result.recordedMinutesCount).toBe(expected.recordedMinutesCount)
      expect(result.detectionMinutesCount).toBe(expected.detectionMinutesCount)
      expect(result.detectionFrequency).toBe(expected.detectionFrequency)
      expect(result.occupiedSiteCount).toBe(expected.occupiedSiteCount)
      expect(result.occupiedSiteFrequency).toBe(expected.occupiedSiteFrequency)
    })

    test('calculate correct detection count, detection frequency, and naive occupancy by taxon, site id and correct species id', async () => {
      // Arrange
      const app = await getMockedApp()
      const expected = {
        totalSiteCount: 1,
        recordedMinutesCount: 7,
        detectionMinutesCount: 1,
        detectionFrequency: 0.14285714285714285,
        occupiedSiteCount: 1,
        occupiedSiteFrequency: 1
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100002', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z', siteIds: SITE_ID_1, taxonClassIds: '100' }
      })

      // Assert
      const result = JSON.parse(response.body)

      expect(result).toBeDefined()
      expect(result.totalSiteCount).toBe(expected.totalSiteCount)
      expect(result.recordedMinutesCount).toBe(expected.recordedMinutesCount)
      expect(result.detectionMinutesCount).toBe(expected.detectionMinutesCount)
      expect(result.detectionFrequency).toBe(expected.detectionFrequency)
      expect(result.occupiedSiteCount).toBe(expected.occupiedSiteCount)
      expect(result.occupiedSiteFrequency).toBe(expected.occupiedSiteFrequency)
    })

    test('calculate empty detection count, detection frequency, and naive occupancy by taxon, site id and species id on empty date', async () => {
      // Arrange
      const app = await getMockedApp()
      const expected = {
        totalSiteCount: 0,
        recordedMinutesCount: 0,
        detectionMinutesCount: 0,
        detectionFrequency: 0,
        occupiedSiteCount: 0,
        occupiedSiteFrequency: 0
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2021-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2021-01-01T00:00:00.000Z', siteIds: SITE_ID_1, taxonClassIds: '100' }
      })

      // Assert
      const result = JSON.parse(response.body)

      expect(result).toBeDefined()
      expect(result.totalSiteCount).toBe(expected.totalSiteCount)
      expect(result.recordedMinutesCount).toBe(expected.recordedMinutesCount)
      expect(result.detectionMinutesCount).toBe(expected.detectionMinutesCount)
      expect(result.detectionFrequency).toBe(expected.detectionFrequency)
      expect(result.occupiedSiteCount).toBe(expected.occupiedSiteCount)
      expect(result.occupiedSiteFrequency).toBe(expected.occupiedSiteFrequency)
    })

    test('calculate empty detection count, detection frequency, and naive occupancy by taxon, site id and not correct species id', async () => {
      // Arrange
      const app = await getMockedApp()
      const expected = {
        totalSiteCount: 1,
        recordedMinutesCount: 7,
        detectionMinutesCount: 0,
        detectionFrequency: 0,
        occupiedSiteCount: 0,
        occupiedSiteFrequency: 0
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z', siteIds: SITE_ID_1, taxonClassIds: '100' }
      })

      // Assert
      const result = JSON.parse(response.body)

      expect(result).toBeDefined()
      expect(result.totalSiteCount).toBe(expected.totalSiteCount)
      expect(result.recordedMinutesCount).toBe(expected.recordedMinutesCount)
      expect(result.detectionMinutesCount).toBe(expected.detectionMinutesCount)
      expect(result.detectionFrequency).toBe(expected.detectionFrequency)
      expect(result.occupiedSiteCount).toBe(expected.occupiedSiteCount)
      expect(result.occupiedSiteFrequency).toBe(expected.occupiedSiteFrequency)
    })

    test('calculates isLocationRedacted correctly', async () => {
      // Arrange
      const app = await getMockedApp()

       // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

       // Assert
      const result = JSON.parse(response.body)?.isLocationRedacted

      expect(result).toBeDefined()
      expect(result).toEqual(false)
    })

    test('calculate correct detection by location site', async () => {
      // Arrange
      const app = await getMockedApp()
      const siteId = 30001001
      const expectedResult = {
        siteId: 30001001,
        siteName: 'Test Site 3',
        latitude: 18.31307,
        longitude: -65.24878,
        siteDetectionMinutesCount: 2,
        siteDetectionFrequency: 0.2857,
        siteOccupied: true
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      const result = JSON.parse(response.body)?.detectionsByLocationSite

      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')

      const actualResult = result[siteId]
      expect(actualResult.siteDetectionMinutesCount).toEqual(expectedResult.siteDetectionMinutesCount)
      expect(actualResult.siteDetectionFrequency).toBeCloseTo(expectedResult.siteDetectionFrequency)
    })

    test('calculate correct detection count and detection frequency for hourly', async () => {
      // Arrange
      const app = await getMockedApp()
      const detectionsByTimeHour: SpotlightDetectionDataByTime = {
        detection: { 10: 2, 12: 1, 15: 1 },
        detectionFrequency: { 10: 0.1, 12: 0.05, 15: 0.05 }
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-23)
      const result = JSON.parse(response.body)?.detectionsByTimeHour

      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
      const expectedResult = result as SpotlightDetectionDataByTime
      expect(expectedResult.detection).toEqual(detectionsByTimeHour.detection)
      expect(expectedResult.detectionFrequency).toEqual(detectionsByTimeHour.detectionFrequency)
    })

    test('calculate correct detection count and detection frequency for day', async () => {
      // Arrange
      const app = await getMockedApp()
      const detectionsByTimeDay: SpotlightDetectionDataByTime = {
        detection: { 1: 4 },
        detectionFrequency: { 1: 0.2 }
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-6)
      const result = JSON.parse(response.body)?.detectionsByTimeDay

      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
      const expectedResult = result as SpotlightDetectionDataByTime
      expect(expectedResult.detection).toEqual(detectionsByTimeDay.detection)
      expect(expectedResult.detectionFrequency).toEqual(detectionsByTimeDay.detectionFrequency)
    })

    test('calculate correct detection count and detection frequency for month', async () => {
      // Arrange
      const app = await getMockedApp()
      const detectionsByTimeMonth: SpotlightDetectionDataByTime = {
        detection: { 1: 4 },
        detectionFrequency: { 1: 0.2 }
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-11)
      const result = JSON.parse(response.body)?.detectionsByTimeMonth

      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
      const expectedResult = result as SpotlightDetectionDataByTime
      expect(expectedResult.detection).toEqual(detectionsByTimeMonth.detection)
      expect(expectedResult.detectionFrequency).toEqual(detectionsByTimeMonth.detectionFrequency)
    })

    test('calculate correct detection count and detection frequency for year', async () => {
      // Arrange
      const app = await getMockedApp()
      const detectionsByTimeYear: SpotlightDetectionDataByTime = {
        detection: { 2022: 4 },
        detectionFrequency: { 2022: 0.2 }
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of years)
      const result = JSON.parse(response.body)?.detectionsByTimeYear

      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
      const expectedResult = result as SpotlightDetectionDataByTime
      expect(expectedResult.detection).toEqual(detectionsByTimeYear.detection)
      expect(expectedResult.detectionFrequency).toEqual(detectionsByTimeYear.detectionFrequency)
    })

    test('calculate correct detection count and detection frequency for date', async () => {
      // Arrange
      const app = await getMockedApp()
      const detectionsByTimeDate: SpotlightDetectionDataByTime = {
        detection: { 1644883200: 4 },
        detectionFrequency: { 1644883200: 0.2 }
      }

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of date unix)
      const result = JSON.parse(response.body)?.detectionsByTimeDate

      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
      const expectedResult = result as SpotlightDetectionDataByTime
      expect(expectedResult.detection).toEqual(detectionsByTimeDate.detection)
      expect(expectedResult.detectionFrequency).toEqual(detectionsByTimeDate.detectionFrequency)
    })

    test('calculate correct detection count and detection frequency for month/year', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '100001', dateStartInclusiveLocalIso: '2022-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of each month/years)
      const result = JSON.parse(response.body)?.detectionsByTimeMonthYear

      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
      const expectedResult = result as SpotlightDetectionDataByTime
      expect(Object.keys(expectedResult.detection)[0]).toEqual('02/2022')
      expect(Object.values(expectedResult.detection)[0]).toEqual(4)
      expect(Object.keys(expectedResult.detectionFrequency)[0]).toEqual('02/2022')
      expect(Object.values(expectedResult.detectionFrequency)[0]).toEqual(0.2)
    })
  })

  describe('client errors', () => {
    test('rejects missing query', async () => {
      // Arrange
      const app = await getMockedApp()

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
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: '/projects/x/spotlight'
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid path params: projectId')
    })

    test('missing species id', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { dateStartInclusiveLocalIso: '2021-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2021-01-01T00:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid query params')
    })

    test('invalid species id', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: 'xxx', dateStartInclusiveLocalIso: '2021-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2021-01-01T00:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid query params')
    })

    test('not found species with given id', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '9999', dateStartInclusiveLocalIso: '2021-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2021-01-01T00:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode).toBe(404)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Data not found')
    })

    test('rejects invalid date', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { speciesId: '1', dateStartInclusiveLocalIso: 'abc', dateEndInclusiveLocalIso: '2031-01-01T00:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid query params')
      expect(errorMessage).toContain('startDate with value')
    })
  })
})
