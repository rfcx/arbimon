import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import fastify, { type FastifyInstance } from 'fastify'
import { resolve } from 'path'

import { AUTH0_DEFAULT_CONFIG } from '~/auth0/config'
import { authenticatePlugin } from './_plugins/authenticate'
import { projectRolePlugin } from './_plugins/project-role'
import { userPlugin } from './_plugins/user'
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
import { findOrCreateUserId } from './users/user-profile-bll'

export const createApp = async (): Promise<FastifyInstance> => {
  // Create app
  const app = await fastify({
    logger: env.NODE_ENV === 'production' ? true : { prettyPrint: true }
  })

  // Register plugins
  await app.register(fastifyCors)
  await app.register(fastifyMultipart)
  await app.register(fastifyStatic, { root: resolve('./public') })
  await app.register(authenticatePlugin, AUTH0_DEFAULT_CONFIG) // decorates `userToken`
  await app.register(userPlugin, { getUserIdCallback: findOrCreateUserId }) // decorates `userId`
  await app.register(projectRolePlugin) // decorates `projectRole`

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
