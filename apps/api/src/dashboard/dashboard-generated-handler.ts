import { DashboardGeneratedParams, DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'

import { getDetectionByHour, getDetectionBySite, getProjectMetrics, getRichnessByExtinction, getRichnessByHour, getRichnessBySite, getRichnessByTaxon, getSpeciesThreatened } from '@/dashboard/dashboard-generated-dao'
import { Handler } from '../_services/api-helpers/types'
import { BioInvalidPathParamError } from '../_services/errors'
import { assertPathParamsExist } from '../_services/validation'

BREAK BUILD

export const dashboardGeneratedHandler: Handler<DashboardGeneratedResponse, DashboardGeneratedParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  // Queries
  const [projectMetrics, speciesThreatened, richnessByExtinction, richnessByHour, richnessBySite, richnessByTaxon, detectionByHour, detectionBySite] = await Promise.all([
    getProjectMetrics(projectIdInteger),
    getSpeciesThreatened(projectIdInteger),
    getRichnessByExtinction(),
    getRichnessByHour(),
    getRichnessBySite(),
    getRichnessByTaxon(),
    getDetectionByHour(),
    getDetectionBySite()
  ])

  // Response
  return {
    ...projectMetrics ?? { detectionCount: 0, siteCount: 0, speciesCount: 0, speciesThreatenedCount: 0 },
    speciesThreatened: speciesThreatened.map(({ taxonSpeciesSlug, taxonClassSlug, scientificName, commonName, riskRatingIucnId, photoUrl }) => ({
      slug: taxonSpeciesSlug,
      taxonSlug: taxonClassSlug,
      scientificName,
      commonName,
      riskId: riskRatingIucnId,
      photoUrl
    })),
    richnessByExtinction,
    richnessByHour,
    richnessBySite,
    richnessByTaxon,
    detectionByHour,
    detectionBySite
  }
}
