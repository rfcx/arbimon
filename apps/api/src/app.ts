import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import { fastifyRequestContextPlugin } from '@fastify/request-context'
import fastifyStatic from '@fastify/static'
import fastify, { type FastifyInstance } from 'fastify'
import fastifyAuth0Verify from 'fastify-auth0-verify'
import { resolve } from 'path'

import { validateAndUpdateUserProfile } from './_middleware/validate-and-update-user-profile'
import { fastifyLruCache } from './_plugins/global-user-cache'
import { env } from './_services/env'
import { routesActivity } from './activity'
import { routesClassifiers } from './classifiers'
import { routesCoreProxy } from './core-proxy'
import { routesDashboard } from './dashboard'
import { routesDetect } from './detect'
import { routesLanding } from './landing'
import { routesOrganizations } from './organizations'
import { routesProjectProfile } from './project-profile'
import { routesProject } from './projects'
import { routesRichness } from './richness'
import { routesSpecies } from './species'
import { routesSpotlight } from './spotlight'
import { routesStatus } from './status'
import { routesSync } from './sync'
import { routesUserProfile } from './users'

export const createApp = async (): Promise<FastifyInstance> => {
  // Create app
  const app = await fastify({
    logger: env.NODE_ENV === 'production' ? true : { prettyPrint: true }
  })

  // Register plugins
  await app.register(fastifyCors)
  await app.register(fastifyMultipart)
  await app.register(fastifyAuth0Verify, {
    domain: 'https://auth.rfcx.org/',
    audience: 'LiojdvNUserGnCaLj8ckcxeGPHOKitOc'
    // audience: 'https://rfcx.org', // 'https://rfcx.eu.auth0.com/api/v2/'
  })
  await app.register(fastifyStatic, { root: resolve('./public') })
  await app.register(fastifyRequestContextPlugin)
  await app.register(fastifyLruCache, {
    maxSize: 500,
    maxAge: 15 * 1000 * 1000 // 15 minutes max age cache
  })
  app.addHook('preValidation', validateAndUpdateUserProfile)
  app.addHook('onRequest', (req, _rep, done) => {
    req.extractedUser = null
    done()
  })

  // Register routes
  const routesRegistrations = [
    routesActivity,
    routesClassifiers,
    routesCoreProxy,
    routesDashboard,
    routesDetect,
    routesLanding,
    routesOrganizations,
    routesProjectProfile,
    routesProject,
    routesRichness,
    routesSpecies,
    routesSpotlight,
    routesStatus,
    routesSync,
    routesUserProfile
  ]

  routesRegistrations
    .flat()
    .forEach(route => app.route({ ...route }))

  return app
}
