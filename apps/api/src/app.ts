import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import fastifyStatic from 'fastify-static'
import { resolve } from 'path'

import { RouteRegistrationOptions } from './_services/api-helper/types'
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
      routeOpts.preValidation = preValidation
    }

    if (preHandler !== undefined) {
      routeOpts.preHandler = preHandler
    }

    return app.route(routeOpts)
  })
