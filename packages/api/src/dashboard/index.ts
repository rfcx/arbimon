import { DashboardGeneratedResponse, Metrics } from 'api-types/dashboard'
import { FastifyPluginAsync } from 'fastify'

import { ApiMissingParam } from '../_services/errors/index.js'

export interface DashboardGeneratedRequest {
  projectId: string
}

export const routesDashboard: FastifyPluginAsync = async (app, option): Promise<void> => {
  app.get<{ Params: Partial<DashboardGeneratedRequest> }>('/:projectId/dashboard-generated', async (req, res): Promise<DashboardGeneratedResponse> => {
    const { projectId } = req.params
    if (!projectId) throw ApiMissingParam('projectId')

    const metrics = getMetrics()

    return {
      metrics
    }
  })
}

// TODO: Update to query from DB
function getMetrics (): Metrics {
  return {
    detectionCount: 50000,
    siteCount: 200,
    speciesCount: 97,
    endangeredSpecies: 10
  }
}
