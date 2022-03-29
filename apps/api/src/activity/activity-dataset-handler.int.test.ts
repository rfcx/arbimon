import fastify, { FastifyInstance } from 'fastify'
import { fastifyRequestContextPlugin } from 'fastify-request-context'
import { describe, expect, test } from 'vitest'

import { activityDatasetGeneratedUrl } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { GET } from '~/api-helpers/types'
import { routesActivity } from './index'

const ROUTE = '/projects/:projectId/activity'

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'detectionsBySite',
  'detectionsBySpecies',
  'detectionsByTimeHour',
  'detectionsByTimeDay',
  'detectionsByTimeMonth',
  'detectionsByTimeDate'
]

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyRequestContextPlugin)

  routesActivity
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
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
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
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
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
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
  })

  // ! All the happy case below should have another set to check for `isLocationRedacted` data

  test(`GET ${ROUTE} calcurate correct detection count, detection frequency, and naive occupancy by site`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsBySite
  })

  test(`GET ${ROUTE} have correct detected species information`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsBySpecies
  })

  test(`GET ${ROUTE} calcurate correct detection count and detection frequency for hourly`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-23)
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsByTimeHour
  })

  test(`GET ${ROUTE} calcurate correct detection count and detection frequency for day`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-6)
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsByTimeDay
  })

  test(`GET ${ROUTE} calcurate correct detection count and detection frequency for month`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-11)
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsByTimeMonth
  })

  test(`GET ${ROUTE} calcurate correct detection count and detection frequency for date`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of date unix)
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    // const detectionsBySite = result.detectionsByTimeDate
  })
})

describe('client errors', () => {
  test(`GET ${ROUTE} rejects missing query`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' })
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
      url: activityDatasetGeneratedUrl({ projectId: 'x' })
    })

    // Assert
    expect(response.statusCode).toBe(400)

    const result = JSON.parse(response.body)
    const errorMessage = result.message
    expect(errorMessage).toContain('Invalid path params: projectId')
  })

  test(`GET ${ROUTE} rejects invalid date`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
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
