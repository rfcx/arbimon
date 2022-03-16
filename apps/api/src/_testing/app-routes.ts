import fastify, { FastifyInstance } from 'fastify'

import { RouteRegistration } from '~/api-helpers/types'

export async function testApp (routes: RouteRegistration[]): Promise<FastifyInstance> {
  const app = await fastify()
  routes.forEach(route => app.route(route))
  return app
}
