import fastify, { FastifyInstance } from 'fastify'
import fastifyAuth0Verify from 'fastify-auth0-verify'
import fastifyCors from 'fastify-cors'
import { fastifyRequestContextPlugin } from 'fastify-request-context'
import fastifyStatic from 'fastify-static'
import { resolve } from 'path'

import { env } from './_services/env'
import { routesActivity } from './activity'
import { routesDashboard } from './dashboard'
import { routesMedia } from './media'
import { routesProject } from './projects'
import { routesRichness } from './richness'
import { routesSpecies } from './species'
import { routesSpotlight } from './spotlight'
import { routesStatus } from './status'

export const createApp = async (): Promise<FastifyInstance> => {
  // Create app
  const app = await fastify({
    logger: env.NODE_ENV === 'production' ? true : { prettyPrint: true }
  })

  // Register plugins
  await app.register(fastifyCors)
  await app.register(fastifyAuth0Verify, {
    domain: 'auth.rfcx.org',
    audience: 'https://rfcx.eu.auth0.com/api/v2/'
  })
  await app.register(fastifyStatic, { root: resolve('./public') })
  await app.register(fastifyRequestContextPlugin)

  // Register routes
  const routesRegistrations = [
    routesDashboard,
    routesMedia,
    routesProject,
    routesSpecies,
    routesRichness,
    routesSpotlight,
    routesActivity,
    routesStatus
  ]

  routesRegistrations
    .flat()
    .forEach(route => app.route({ ...route }))

  return app
}
