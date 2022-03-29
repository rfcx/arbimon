import fastify, { FastifyInstance } from 'fastify'
import { fastifyRequestContextPlugin } from 'fastify-request-context'
import { describe, expect, test } from 'vitest'

import { spotlightDatasetUrl } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

import { GET } from '~/api-helpers/types'
import { routesSpotlight } from './index'

const ROUTE = '/projects/:projectId/spotlight'

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'totalSiteCount',
  'totalRecordingCount',
  'detectionCount',
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

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyRequestContextPlugin)

  routesSpotlight
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

describe('happy path', () => {
  test(`GET ${ROUTE} exists`, async () => {
   // Arrange
   const app = await getMockedApp()

   // Act
   const routes = app.printRoutes()

   // Assert
   expect(routes).toContain(ROUTE)
  })

  test(`GET ${ROUTE} returns successfully`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '' }
    })

    // Assert
    expect(response.statusCode).toBe(200)

    const result = JSON.parse(response.body)
    expect(result).toBeDefined()
    expect(result).toBeTypeOf('object')
  })

  test(`GET ${ROUTE} contains all expected props`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '' }
    })

    // Assert
    const result = JSON.parse(response.body)
    EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
  })

  test(`GET ${ROUTE} does not contain any additional props`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
  })

  test(`GET ${ROUTE} calculate correct total site count, recording count, detection count, detection frequency, occupied site count, and occupied site frequency`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '' }
    })

    // Assert
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const totalSiteCount = result.totalSiteCount
    // const totalRecordingCount = result.totalRecordingCount
    // const detectionCount = result.detectionCount
    // const detectionFrequency = result.detectionFrequency
    // const occupiedSiteCount = result.occupiedSiteCount
    // const occupiedSiteFrequency = result.occupiedSiteFrequency
  })

  // ! All the happy case below must have another set to check for `isLocationRedacted` data

  test(`GET ${ROUTE} calculate correct detection count, detection frequency, and naive occupancy by site`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsByLocationSite
  })

  test(`GET ${ROUTE} calculate correct detection count and detection frequency for hourly`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-23)
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsByTimeHour
  })

  test(`GET ${ROUTE} calculate correct detection count and detection frequency for day`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-6)
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsByTimeDay
  })

  test(`GET ${ROUTE} calculate correct detection count and detection frequency for month`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-11)
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsByTimeMonth
  })

  test(`GET ${ROUTE} calculate correct detection count and detection frequency for year`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of years)
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsByTimeYear
  })

  test(`GET ${ROUTE} calculate correct detection count and detection frequency for date`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of date unix)
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsByTimeDate
  })

  test(`GET ${ROUTE} calculate correct detection count and detection frequency for month/year`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of each month/years)
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsByTimeMonthYear
  })
})

describe('client errors', () => {
  test(`GET ${ROUTE} rejects missing query`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' })
    })

    // Assert
    expect(response.statusCode).toBe(400)
  })

  test(`GET ${ROUTE} rejects invalid project id`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: 'x' })
    })

    // Assert
    expect(response.statusCode).toBe(400)

    const result = JSON.parse(response.body)
    const errorMessage = result.message
    expect(errorMessage).toContain('Invalid path params: projectId')
  })

  test(`GET ${ROUTE} missing species id`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert
    expect(response.statusCode).toBe(400)

    const result = JSON.parse(response.body)
    const errorMessage = result.message
    expect(errorMessage).toContain('Invalid query params')
  })

  test(`GET ${ROUTE} invalid species id`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: 'xxx', startDate: '2021-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert
    expect(response.statusCode).toBe(400)

    const result = JSON.parse(response.body)
    const errorMessage = result.message
    expect(errorMessage).toContain('Invalid query params')
  })

  test(`GET ${ROUTE} not found species with given id`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { speciesId: '9999', startDate: '2021-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert
    expect(response.statusCode).toBe(404)

    const result = JSON.parse(response.body)
    const errorMessage = result.message
    expect(errorMessage).toContain('Data not found')
  })

  test(`GET ${ROUTE} rejects invalid date`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: spotlightDatasetUrl({ projectId: '1' }),
      query: { startDate: 'abc', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert
    expect(response.statusCode).toBe(400)

    const result = JSON.parse(response.body)
    const errorMessage = result.message
    expect(errorMessage).toContain('Invalid query params')
    expect(errorMessage).toContain('startDate with value')
  })
})
