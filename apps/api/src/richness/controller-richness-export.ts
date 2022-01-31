import { RichnessByExportParams, RichnessByExportQuery, RichnessByExportResponse } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { EXTINCTION_RISK_PROTECTED_CODES } from '@rfcx-bio/common/iucn'
import { MockHourlyDetectionSummary, rawDetections, rawSpecies } from '@rfcx-bio/common/mock-data'

import { Handler } from '../_services/api-helpers/types'
import { filterMocksByParameters } from '../_services/mock-helper'
import { isProjectMember } from '../_services/permission-helper/permission-helper'
import { assertInvalidQuery, assertParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'

export const RichnessExportHandler: Handler<RichnessByExportResponse, RichnessByExportParams, RichnessByExportQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  const { startDate: startDateUtcInclusive, endDate: endDateUtcInclusive, siteIds, taxons } = req.query
  if (!isValidDate(startDateUtcInclusive)) assertInvalidQuery({ startDateUtcInclusive })
  if (!isValidDate(endDateUtcInclusive)) assertInvalidQuery({ endDateUtcInclusive })

  // Query
  const convertedQuery = {
    startDateUtcInclusive,
    endDateUtcInclusive,
    siteIds: siteIds ?? [],
    taxons: taxons ?? []
  }

  const detections = filterMocksByParameters(rawDetections, { ...convertedQuery })
  const isLocationRedacted = !isProjectMember(req)
  const speciesByExport = await getRichnessDatasetInformation(detections, isLocationRedacted)

  return { speciesByExport, isLocationRedacted }
}

async function getRichnessDatasetInformation (detections: MockHourlyDetectionSummary[], isLocationRedacted: boolean): Promise<MockHourlyDetectionSummary[]> {
  if (isLocationRedacted) {
    const protectedSpeciesIds = rawSpecies.filter(({ extinctionRisk }) => EXTINCTION_RISK_PROTECTED_CODES.includes(extinctionRisk)).map(({ speciesId }) => speciesId)
    return detections.filter(({ species_id: speciesId }) => !protectedSpeciesIds.includes(speciesId))
  }

  return detections
}
