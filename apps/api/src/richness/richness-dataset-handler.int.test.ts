import fastify, { FastifyInstance } from 'fastify'
import { fastifyRequestContextPlugin } from 'fastify-request-context'
import { describe, expect, test } from 'vitest'

import { richnessDatasetUrl } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { GET } from '~/api-helpers/types'
import { routesRichness } from './index'

const ROUTE = '/projects/:projectId/richness'

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'richnessByTaxon',
  'richnessBySite',
  'richnessByTimeHourOfDay',
  'richnessByTimeDayOfWeek',
  'richnessByTimeMonthOfYear',
  'richnessByTimeUnix',
  'richnessPresence'
]

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyRequestContextPlugin)

  routesRichness
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
      url: '/projects/1/richness',
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
      url: richnessDatasetUrl({ projectId: '1' }),
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
      url: richnessDatasetUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
    })

    // Assert
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
  })
})

describe('validate known data', () => {
  test(`GET ${ROUTE} does not have any data on given date`, async () => {
    // Arrange
    const app = await getMockedApp()

    // Act
    const response = await app.inject({
      method: GET,
      url: richnessDatasetUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2002-01-01T00:00:00.000Z' }
    })

    // Assert
    const result = JSON.parse(response.body)
    Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))

    expect(result.richnessBySite).toEqual([])
    expect(result.richnessByTaxon).toEqual({})
    expect(result.richnessByTimeDayOfWeek).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 })
    expect(result.richnessByTimeUnix).toEqual({})
    expect(result.richnessPresence).toEqual([])
  })
})

describe('client errors', () => {
  test(`GET ${ROUTE} rejects missing query`, async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
      method: GET,
      url: '/projects/1/richness'
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
      url: '/projects/x/richness'
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
      url: '/projects/1/richness',
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
