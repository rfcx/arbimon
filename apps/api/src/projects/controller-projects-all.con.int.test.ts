import { expect, test } from 'vitest'
import fastify, { FastifyInstance } from 'fastify'
import { routesProject } from '.'
import { projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'
import { GET } from '~/api-helpers/types'

test('Example', async () => {
  const app = await fastify({ logger: true })
  const route = routesProject.find(r => r.url === projectsRoute)
  if (!route) { assert(false); return }
  app.route(route)

  // Act
  const response = await app.inject({
    method: GET,
    url: projectsRoute
  })

  // Assert
  expect(response.statusCode).toBe(200)
})

