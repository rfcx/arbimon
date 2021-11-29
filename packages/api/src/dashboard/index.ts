import { FastifyPluginAsync } from 'fastify'

import { dashboardGeneratedRoute } from '../TEMP/api-bio-types/dashboard-generated.js'
import { dashboardProfileRoute } from '../TEMP/api-bio-types/dashboard-profile.js'
import { dashboardRichnessRoute } from '../TEMP/api-bio-types/dashboard-richness.js'
import { dashboardGeneratedController } from './dashboard-generated-controller.js'
import { dashboardProfileController } from './dashboard-profile-controller.js'
import { dashboardRichnessController } from './dashboard-richness-controller.js'

export const routesDashboard: FastifyPluginAsync = async (app, option): Promise<void> => {
  app.get(dashboardGeneratedRoute, dashboardGeneratedController)
  app.get(dashboardProfileRoute, dashboardProfileController)
  app.get(dashboardRichnessRoute, dashboardRichnessController)
}
