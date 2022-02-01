import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import { fastifyRequestContextPlugin } from 'fastify-request-context'
import fastifyStatic from 'fastify-static'
import { resolve } from 'path'

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
await app.register(fastifyRequestContextPlugin)

// Register routes
const routesRegistrations = [
  routesDashboard,
  routesProject,
  routesSpecies,
  routesRichness,
  routesSpotlight,
  routesActivity,
  routesStatus
]

routesRegistrations
  .flat()
  .forEach(route => app.route({ ...route }))
