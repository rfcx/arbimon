import fastifyRoutes from '@fastify/routes'
import fastify, { FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { GET } from '~/api-helpers/types'
import { routesDashboard } from './index'

const ROUTE = '/projects/:projectId/dashboard-profile'

const EXPECTED_PROPS = [
  'summary',
  'readme',
  'speciesHighlighted'
]

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  await app.register(fastifyRoutes)

  routesDashboard
    .map(({ preHandler, ...rest }) => ({ ...rest }))
    .forEach(route => app.route(route))

  return app
}

describe(`GET ${ROUTE} (dashboard profile)`, () => {
  describe('simple test', () => {
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
        url: '/projects/1/dashboard-profile'
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
        url: '/projects/1/dashboard-profile'
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
      expect(Object.keys(result).length).toBe(EXPECTED_PROPS.length)
    })
  })
})
