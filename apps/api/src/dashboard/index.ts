import { FastifyPluginAsync } from 'fastify'

import { dashboardGeneratedRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { dashboardProfileRoute } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'

import { dashboardGeneratedController } from './dashboard-generated-controller'
import { dashboardProfileController } from './dashboard-profile-controller'

export const routesDashboard: FastifyPluginAsync = async (app, option): Promise<void> => {
  app.get(dashboardGeneratedRoute, dashboardGeneratedController)
  app.get(dashboardProfileRoute, dashboardProfileController)
}
