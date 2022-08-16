import { fastifyRequestContextPlugin } from '@fastify/request-context'
import fastifyRoutes from '@fastify/routes'
import fastify, { FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { GET } from '~/api-helpers/types'
import { routesRichness } from './index'

const PROJECT_ID_BASIC = '10001001'

const ROUTE = '/projects/:projectId/richness'
const URL = `/projects/${PROJECT_ID_BASIC}/richness`

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
  await app.register(fastifyRoutes)
  await app.register(fastifyRequestContextPlugin)

  routesRichness
    .map(({ preHandler, ...rest }) => ({ ...rest }))
    .forEach(route => app.route(route))

  return app
}

describe(`GET ${ROUTE} (richness dataset)`, () => {
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
        query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2021-01-01T00:00:00.000Z' }
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
        query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2021-01-01T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
    })

    test('does not contain any additional props', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2021-01-01T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    })
  })

  describe('validate known data', () => {
    test('does not have any data on given date', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: URL,
        query: { dateStartInclusiveLocalIso: '2001-01-01T00:00:00.000Z', dateEndInclusiveLocalIso: '2002-01-01T00:00:00.000Z' }
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
        url: '/projects/x/richness'
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid path params: projectId')
    })

    test('rejects invalid date', async () => {
        // Arrange
        const app = await getMockedApp()

        // Act
        const response = await app.inject({
        method: GET,
        url: URL,
        query: { dateStartInclusiveLocalIso: 'abc', dateEndInclusiveLocalIso: '2021-01-01T00:00:00.000Z' }
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
