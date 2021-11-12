import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import { resolve } from 'path'

import { routesIndex } from './index/index.js'
import { routesProjectSite } from './projects-and-sites/index.js'

export const app = fastify({
  logger: process.env.NODE_ENV !== 'production'
})

// Register plugins
await app.register(fastifyStatic, { root: resolve('./public') })

// Register routes
const routePlugins = [routesIndex, routesProjectSite]
await Promise.all(routePlugins.map(plugin => app.register(plugin)))
