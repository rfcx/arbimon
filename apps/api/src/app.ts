import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import fastifyStatic from 'fastify-static'
import { resolve } from 'path'

import { env } from './_services/env'
import { routesDashboard } from './dashboard'
import { routesProjectSite } from './projects-and-sites'
import { routesRichness } from './richness'
import { routesSpecies } from './species'
import { routesSpotlight } from './spotlight'
import { routesStatus } from './status'

export const app = fastify({
  logger: env.NODE_ENV === 'production'
    ? false
    : { prettyPrint: true }
})

// Register plugins
await app.register(fastifyCors)
await app.register(fastifyStatic, { root: resolve('./public') })

// Register routes
const routePlugins = [
  routesStatus,
  routesProjectSite,
  routesSpecies,
  routesRichness,
  routesSpotlight,
  routesDashboard
]
await Promise.all(routePlugins.map(plugin => app.register(plugin)))
