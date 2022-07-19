import fastify, { FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { GET } from '~/api-helpers/types'
import { routeDetectRecording } from './index'

const ROUTE = '/project/:projectId/detect-recording'

const EXPECTED_PROPS = [
  'totalDetectionInMinutes'
]

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

  routeDetectRecording
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

describe('GET /project/:projectId/detect-recording', () => {
  describe('simple tests', () => {
    test('exists', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const routes = app.printRoutes()

      // Assert
      expect(routes).toContain(ROUTE)
    })

    test.todo('returns successfully', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const response = await app.inject({
        method: GET,
        url: '/projects/1/detect-recording',
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test.todo('contains all expected props', async () => {
      // Arrange
      const app = await getMockedAppLoggedOut()

      // Act
      const response = await app.inject({
        method: GET,
        url: '/projects/1/detect-recording',
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
    })
  })

  describe.todo('known data tests', () => {

  })

  describe.todo('client errros', () => {

  })
})
