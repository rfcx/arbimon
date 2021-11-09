import fastify from 'fastify'

import { routesIndex } from './index/index.js'
import { routesProjectSite } from './projects-and-sites/index.js'

export const app = fastify({
  logger: process.env.NODE_ENV !== 'production'
})

// Register plugins (ex: routes)
const plugins = [routesIndex, routesProjectSite]
await Promise.all(plugins.map(plugin => app.register(plugin)))
