import { sum } from 'lodash-es'

import { spotlightDatasetParams, SpotlightDatasetQuery, SpotlightDatasetResponse } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { MockHourlyDetectionSummary, rawDetections, rawSpecies } from '@rfcx-bio/common/mock-data'

import { Controller } from '~/api-helper/types'
import { ApiNotFoundError } from '~/errors'
import { FilterDataset, filterMocksByParameters, filterMocksBySpecies } from '~/mock-helper'
import { assertInvalidQuery, assertParamsExist } from '~/validation'
import { isValidDate } from '~/validation/query-validation'

export const spotlightDatasetController: Controller<SpotlightDatasetResponse, spotlightDatasetParams, SpotlightDatasetQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  const { speciesId, startDate, endDate, siteIds, taxons } = req.query
  if (isNaN(+speciesId)) assertInvalidQuery({ speciesId })
  if (!isValidDate(startDate)) assertInvalidQuery({ startDate })
  if (!isValidDate(endDate)) assertInvalidQuery({ endDate })

  const species = rawSpecies.find(s => s.speciesId === Number(speciesId))
  if (!species) throw ApiNotFoundError()

  // Query
  const convertedQuery = {
    startDateUtc: startDate,
    endDateUtc: endDate,
    siteIds: siteIds ?? [],
    taxons: taxons ?? []
  }
  const response = await getSpotligthDatasetInformation({ ...convertedQuery }, projectId, species.speciesId)

  // Response
  return response
}

async function getSpotligthDatasetInformation (filter: FilterDataset, projectId: string, speciesId: number): Promise<SpotlightDatasetResponse> {
  // Filtering
  const totalSummaries = filterMocksByParameters(rawDetections, filter)
  const speciesSummaries = filterMocksBySpecies(totalSummaries, speciesId)

  // Metrics
  const totalRecordingCount = getRecordingCount(totalSummaries)
  const detectionCount = sum(speciesSummaries.map(d => d.num_of_recordings)) // 1 recording = 1 detection
  const detectionFrequency = totalRecordingCount === 0 ? 0 : detectionCount / totalRecordingCount

  const totalSiteCount = new Set(totalSummaries.map(d => d.stream_id)).size
  const occupiedSiteCount = new Set(speciesSummaries.map(d => d.stream_id)).size
  const occupiedSiteFrequency = totalSiteCount === 0 ? 0 : occupiedSiteCount / totalSiteCount

  return {
    totalSiteCount,
    totalRecordingCount,
    detectionCount,
    detectionFrequency,
    occupiedSiteCount,
    occupiedSiteFrequency
  }
}

function getRecordingCount (detections: MockHourlyDetectionSummary[]): number {
  return new Set(detections.map(d => `${d.date}-${d.hour}`)).size * 12
}
