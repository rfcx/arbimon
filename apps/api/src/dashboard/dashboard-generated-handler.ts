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
  const [projectMetrics, speciesThreatened, richnessByTaxon, richnessByRisk, richnessByHour, richnessBySite, detectionByHour, detectionBySite] = await Promise.all([
    getProjectMetrics(projectIdInteger),
    getSpeciesThreatened(projectIdInteger),
    getRichnessByTaxon(projectIdInteger),
    getRichnessByRisk(projectIdInteger),
    getRichnessByHour(),
    getRichnessBySite(),
    getDetectionByHour(),
    getDetectionBySite()
  ])

  // Response
  return {
    ...projectMetrics ?? { detectionCount: 0, siteCount: 0, speciesCount: 0 },
    speciesThreatenedCount: speciesThreatened.length,
    speciesThreatened: speciesThreatened.map(({ taxonSpeciesSlug, taxonClassSlug, scientificName, commonName, riskRatingIucnId, photoUrl }) => ({
      slug: taxonSpeciesSlug,
      taxonSlug: taxonClassSlug,
      scientificName,
      commonName,
      riskId: riskRatingIucnId,
      photoUrl
    })),
    richnessByTaxon: richnessByTaxon.map(r => [r.taxonClassId, r.count]),
    richnessByRisk: richnessByRisk.map(r => [r.riskRatingIucnId, r.count]),
    richnessByHour,
    richnessBySite,
    detectionByHour,
    detectionBySite
  }
}
