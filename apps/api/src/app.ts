import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import { fastifyRequestContextPlugin } from 'fastify-request-context'
import fastifyStatic from 'fastify-static'
import { resolve } from 'path'

import { RouteRegistration } from './_services/api-helper/types'
import { env } from './_services/env'
import { routesActivity } from './activity'
import { routesDashboard } from './dashboard'
import { routesProject } from './projects'
import { routesRichness } from './richness'
import { routesSpecies } from './species'
import { routesSpotlight } from './spotlight'
import { routesStatus } from './status'

export const app = fastify({
  logger: env.NODE_ENV === 'production' ? false : { prettyPrint: true }
})

// Register plugins
await app.register(fastifyCors)
await app.register(fastifyStatic, { root: resolve('./public') })
await app.register(fastifyRequestContextPlugin, {
  defaultStoreValues: {
    projectPermission: undefined
  }
})

// Register routes (old version)
const routePlugins = [
  routesStatus
]
await Promise.all(routePlugins.map(plugin => app.register(plugin)))

// Register routes
const routesRegistrations = [
  routesDashboard,
  routesProject,
  routesSpecies,
  routesRichness,
  routesSpotlight,
  routesActivity
]

routesRegistrations
  .flat()
  .forEach(({ method, url, handler, schema, preValidation, preHandler }) => {
    const routeOpts: RouteRegistration = { method, url, handler }

    if (schema !== undefined) {
      routeOpts.schema = schema
    }

    if (preValidation !== undefined) {
      /**
       * Idea for this is move `app.authenticate` to each router which need authenticate token by Auth0
       * Use `req.user` to use the information in Auth0
       * More information here: https://github.com/nearform/fastify-auth0-verify
       */
      // routeOpts.preValidation = [app.authenticate]
      routeOpts.preValidation = preValidation
    }

    if (preHandler !== undefined) {
      routeOpts.preHandler = preHandler
    }

    return app.route(routeOpts)
  })
