import fastifyRoutes from '@fastify/routes'
import fastify, { type FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { GET } from '~/api-helpers/types'
import { routesProject } from './index'

const PROJECT_ID_BASIC = '40001001'

const ROUTE = '/projects/:projectId/project-location'
const url = `/projects/${PROJECT_ID_BASIC}/project-location`

const EXPECTED_PROPS = [
  'country',
  'code'
]

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  await app.register(fastifyRoutes)

  routesProject
    .map(({ preHandler, ...rest }) => ({ ...rest }))
    .forEach(route => app.route(route))

  return app
}

describe(`GET ${ROUTE} (project location)`, () => {
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
        url
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
        url
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => { expect(result).toHaveProperty(expectedProp) })
      expect(Object.keys(result)).toHaveLength(EXPECTED_PROPS.length)
    })
  })
})