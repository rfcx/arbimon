import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import fastifyStatic from 'fastify-static'
import { resolve } from 'path'

import { routesActivityPatterns } from './activity-patterns/index.js'
import { routesIndex } from './index/index.js'
import { routesIUCN } from './iucn/index.js'
import { routesProjectSite } from './projects-and-sites/index.js'
import { routesSpeciesRichness } from './species-richness/index.js'

export const app = fastify({
  logger: process.env.NODE_ENV !== 'production'
})

// Register plugins
await app.register(fastifyCors)
await app.register(fastifyStatic, { root: resolve('./public') })

// Register routes
const routePlugins = [routesIndex, routesProjectSite, routesSpeciesRichness, routesActivityPatterns, routesIUCN]
await Promise.all(routePlugins.map(plugin => app.register(plugin)))
