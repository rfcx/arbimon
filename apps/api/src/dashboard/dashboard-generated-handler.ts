import { DashboardGeneratedParams, DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'

import { getDetectionByHour, getDetectionBySite, getProjectMetrics, getRichnessByHour, getRichnessByRisk, getRichnessBySite, getRichnessByTaxon, getSpeciesThreatened } from '@/dashboard/dashboard-generated-dao'
import { Handler } from '../_services/api-helpers/types'
import { BioInvalidPathParamError } from '../_services/errors'
import { assertPathParamsExist } from '../_services/validation'

export const dashboardGeneratedHandler: Handler<DashboardGeneratedResponse, DashboardGeneratedParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  // Queries
  const [projectMetrics, speciesThreatened, richnessByTaxon, richnessByRisk, richnessBySite, detectionBySite, richnessByHour, detectionByHour] = await Promise.all([
    getProjectMetrics(projectIdInteger),
    getSpeciesThreatened(projectIdInteger),
    getRichnessByTaxon(projectIdInteger),
    getRichnessByRisk(projectIdInteger),
    getRichnessBySite(projectIdInteger),
    getDetectionBySite(projectIdInteger),
    getRichnessByHour(projectIdInteger),
    getDetectionByHour(projectIdInteger)
  ])

  // Response
  return {
    ...projectMetrics,
    speciesThreatenedCount: speciesThreatened.length,
    speciesThreatened,
    richnessByTaxon,
    richnessByRisk,
    richnessBySite,
    detectionBySite,
    richnessByHour,
    detectionByHour
  }
}
