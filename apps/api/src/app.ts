import fastify from 'fastify'
import fastifyAuth0Verify from 'fastify-auth0-verify'
import fastifyCors from 'fastify-cors'
import fastifyStatic from 'fastify-static'
import { resolve } from 'path'

import { RouteRegistrationOptions } from './_services/api-helper/types'
import { config } from './_services/auth-client/env'
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
await app.register(fastifyAuth0Verify, {
  domain: config.domain
})

app.decorateRequest('projectPermission', undefined)

// Register routes (old version)
const routePlugins = [
  routesStatus,
  routesRichness
]
await Promise.all(routePlugins.map(plugin => app.register(plugin)))

// Register routes
const routesRegistrations = [
  routesDashboard,
  routesProject,
  routesSpecies,
  routesSpotlight,
  routesActivity
]

routesRegistrations
  .flat()
  .forEach(({ method, route: url, controller: handler, schema, preValidation, preHandler }) => {
    const routeOpts: RouteRegistrationOptions = { method, url, handler }

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
