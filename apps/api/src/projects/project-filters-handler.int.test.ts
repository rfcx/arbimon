import { fastifyRequestContextPlugin } from '@fastify/request-context'
import fastify, { FastifyInstance } from 'fastify'
import { expect, test } from 'vitest'

import { GET } from '~/api-helpers/types'
import { routesProject } from './index'

const ROUTE = '/projects/:projectId/filters'

const EXPECTED_PROPS = [
  'locationSites',
  'taxonClasses',
  'dateStartInclusiveUtc',
  'dateEndInclusiveUtc',
  'latestSync'
]

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyRequestContextPlugin)

  routesProject
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

describe(`GET ${ROUTE}  contains valid project`, async () => {
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
        url: '/projects/1/filters'
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props & no more', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: '/projects/1/filters'
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
      expect(Object.keys(result).length).toBe(EXPECTED_PROPS.length)
    })
  })
  describe('known data tests', async () => {
    // Arrange & Act once
    const app = await getMockedApp()

    const response = await app.inject({
      method: GET,
      url: '/projects/1/filters'
    })

    const result = JSON.parse(response.body)

    test('return all sites in project', async () => {
      expect(result.locationSites.length).toEqual(877)
    })
  })
})
