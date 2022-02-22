import { DashboardGeneratedParams, DashboardGeneratedResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'

import { getDetectionByHour, getDetectionBySite, getProjectMetrics, getRichnessByExtinction, getRichnessByHour, getRichnessBySite, getRichnessByTaxon, getSpeciesThreatened } from '@/dashboard/dashboard-generated-dao'
import { Handler } from '../_services/api-helpers/types'
import { BioInvalidPathParamError, BioNotFoundError } from '../_services/errors'
import { assertPathParamsExist } from '../_services/validation'

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

  if (!projectMetrics) throw BioNotFoundError()

  // Response
  return {
    ...projectMetrics,
    speciesThreatened: speciesThreatened.map(({ taxonSpeciesSlug, taxonClassSlug, scientificName, commonName, riskRatingIucnId, photoUrl }) => ({
      slug: taxonSpeciesSlug,
      taxonSlug: taxonClassSlug,
      scientificName,
      commonName,
      riskId: riskRatingIucnId,
      photoUrl,
      extinctionRisk: 'NE' // TODO: Delete this
    })),
    richnessByExtinction,
    richnessByHour,
    richnessBySite,
    richnessByTaxon,
    detectionByHour,
    detectionBySite
  }
}
