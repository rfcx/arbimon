import fastify from 'fastify'
import { expect, test } from 'vitest'

import { projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'

import { GET } from '~/api-helpers/types'
// eslint-disable-next-line no-restricted-imports -- Allowed in tests
import { routesProject } from '.'

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
