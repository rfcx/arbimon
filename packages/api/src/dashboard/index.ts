import { dashboardGeneratedController } from 'dashboard/dashboard-generated-controller.js'
import { FastifyPluginAsync } from 'fastify'

import { dashboardGeneratedRoute } from '../TEMP/api-bio-types/dashboard-generated.js'

export const routesDashboard: FastifyPluginAsync = async (app, option): Promise<void> => {
  app.get(dashboardGeneratedRoute, dashboardGeneratedController)
}
