import { DashboardGeneratedParams, DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { rawSites, rawSpecies } from '@rfcx-bio/common/mock-data'

import { getDetectionByHour, getDetectionBySite, getDetectionCount, getRichnessByExtinction, getRichnessByHour, getRichnessBySite, getRichnessByTaxon, getSpeciesThreatened } from '@/dashboard/dashboard-generated-dao'
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
  const [speciesThreatened, detectionCount, richnessByExtinction, richnessByHour, richnessBySite, richnessByTaxon, detectionByHour, detectionBySite] = await Promise.all([
    getSpeciesThreatened(),
    getDetectionCount(),
    getRichnessByExtinction(),
    getRichnessByHour(),
    getRichnessBySite(),
    getRichnessByTaxon(),
    getDetectionByHour(),
    getDetectionBySite()
  ])

  // Response
  return {
    detectionCount,
    siteCount: rawSites.length,
    speciesCount: rawSpecies.length,
    speciesThreatenedCount: speciesThreatened.length,
    speciesThreatened,
    richnessByExtinction,
    richnessByHour,
    richnessBySite,
    richnessByTaxon,
    detectionByHour,
    detectionBySite
  }
}
