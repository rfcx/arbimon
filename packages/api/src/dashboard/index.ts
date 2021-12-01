import { FastifyPluginAsync } from 'fastify'

import { dashboardGeneratedRoute } from '../Z_COMMON/api-bio-types/dashboard-generated.js'
import { dashboardProfileRoute } from '../Z_COMMON/api-bio-types/dashboard-profile.js'
import { dashboardGeneratedController } from './dashboard-generated-controller.js'
import { dashboardProfileController } from './dashboard-profile-controller.js'

export const routesDashboard: FastifyPluginAsync = async (app, option): Promise<void> => {
  app.get(dashboardGeneratedRoute, dashboardGeneratedController)
  app.get(dashboardProfileRoute, dashboardProfileController)
}
