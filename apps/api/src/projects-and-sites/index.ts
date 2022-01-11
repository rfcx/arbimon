import { FastifyPluginAsync } from 'fastify'

import { projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'
import { sitesRoute } from '@rfcx-bio/common/api-bio/common/sites'

import { projectsController, sitesController } from './controllers'

export const routesProjectSite: FastifyPluginAsync = async (app, options): Promise<void> => {
  app.get(projectsRoute, projectsController)
  app.get(sitesRoute, sitesController)
}
