import { FastifyPluginAsync } from 'fastify'

import { dashboardGeneratedRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { dashboardProfileRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'

import { dashboardGeneratedController, dashboardProfileController } from './controllers'

export const routesDashboard: FastifyPluginAsync = async (app, option): Promise<void> => {
  app.get(dashboardGeneratedRoute, dashboardGeneratedController)
  app.get(dashboardProfileRoute, dashboardProfileController)
}
