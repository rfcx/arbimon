import fastifyRoutes from '@fastify/routes'
import fastify, { FastifyInstance } from 'fastify'
import { expect, test } from 'vitest'

import { projectsRoute } from '@rfcx-bio/common/api-bio/project/projects'

import { GET } from '~/api-helpers/types'
import { routesProject } from './index'

const getMockedAppLoggedIn = async (): Promise<FastifyInstance> => {
  const app = await fastify()
  await app.register(fastifyRoutes)

  const fakeRequestContext = {
    get: (key: string) => ({
      IS_PROJECT_MEMBER: true,
      MEMBER_PROJECT_CORE_IDS: ['integration5']
    })[key],
    set: (key: string, value: any) => {}
  }

  app.decorate('requestContext', fakeRequestContext)
  app.decorateRequest('requestContext', fakeRequestContext)

  routesProject
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

test('GET /projects contains valid project', async () => {
  // Arrange
  const app = await getMockedAppLoggedIn()

  // Act
  const response = await app.inject({
    method: GET,
    url: projectsRoute
  })

  // Assert
  expect(response.statusCode).toBe(200)

  const result = JSON.parse(response.body)
  const expectedProject = result.find((p: any) => p.slug === 'integration-test-project-50001001')
  expect(expectedProject).toBeDefined()
  expect(expectedProject.name).toBe('Integration Test Project 5')
})
