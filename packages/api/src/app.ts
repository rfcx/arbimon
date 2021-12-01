import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import fastifyStatic from 'fastify-static'
import { resolve } from 'path'

import { env } from './_services/env/index.js'
import { routesDashboard } from './dashboard/index.js'
import { routesIndex } from './index/index.js'
import { routesProjectSite } from './projects-and-sites/index.js'
import { routesRichness } from './richness/index.js'
import { routesSpecies } from './species/index.js'
import { routesIucn } from './species/iucn/index.js'
import { routesSpotlight } from './spotlight/index.js'

export const app = fastify({
  logger: env.NODE_ENV !== 'production'
})

// Register plugins
await app.register(fastifyCors)
await app.register(fastifyStatic, { root: resolve('./public') })

// Register routes
const routePlugins = [
  routesIndex,
  routesProjectSite,
  routesSpecies,
  routesRichness,
  routesSpotlight,
  routesIucn,
  routesDashboard
]
await Promise.all(routePlugins.map(plugin => app.register(plugin)))
