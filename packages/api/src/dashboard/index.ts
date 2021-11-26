import { FastifyPluginAsync } from 'fastify'

import { dashboardGeneratedRoute } from '../TEMP/api-bio-types/dashboard-generated.js'
import { dashboardGeneratedController } from './dashboard-generated-controller.js'

export const routesDashboard: FastifyPluginAsync = async (app, option): Promise<void> => {
  app.get(dashboardGeneratedRoute, dashboardGeneratedController)
}
