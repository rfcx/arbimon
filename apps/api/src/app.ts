import fastifyCors from '@fastify/cors'
import { fastifyRequestContextPlugin } from '@fastify/request-context'
import fastifyStatic from '@fastify/static'
import fastify, { type FastifyInstance } from 'fastify'
import fastifyAuth0Verify from 'fastify-auth0-verify'
import { resolve } from 'path'

import { env } from './_services/env'
import { routesActivity } from './activity'
import { routesClassifiers } from './classifiers'
import { routesCoreProxy } from './core-proxy'
import { routesDashboard } from './dashboard'
import { routesDetect } from './detect'
import { routesLanding } from './landing'
import { routesProject } from './projects'
import { routesRichness } from './richness'
import { routesSpecies } from './species'
import { routesSpotlight } from './spotlight'
import { routesStatus } from './status'
import { routesSync } from './sync'

export const createApp = async (): Promise<FastifyInstance> => {
  // Create app
  const app = await fastify({
    logger: env.NODE_ENV === 'production' ? true : { prettyPrint: true }
  })

  // Register plugins
  await app.register(fastifyCors)
  await app.register(fastifyAuth0Verify, {
    domain: 'auth.rfcx.org',
    audience: 'https://rfcx.org' // 'https://rfcx.eu.auth0.com/api/v2/'
  })
  await app.register(fastifyStatic, { root: resolve('./public') })
  await app.register(fastifyRequestContextPlugin)

  // Register routes
  const routesRegistrations = [
    routesDashboard,
    routesCoreProxy,
    routesProject,
    routesSpecies,
    routesRichness,
    routesSpotlight,
    routesActivity,
    routesDetect,
    routesStatus,
    routesSync,
    routesClassifiers,
    routesLanding
  ]

  routesRegistrations
    .flat()
    .forEach(route => app.route({ ...route }))

  return app
}
