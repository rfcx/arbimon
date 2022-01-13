import { isDate, isNumber, sum } from 'lodash-es'

import { FilterDataset } from '@rfcx-bio/common/api-bio/common/filter'
import { spotlightDatasetParams, SpotlightDatasetQuery, SpotlightDatasetResponse } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { MockHourlyDetectionSummary, rawDetections, rawSpecies } from '@rfcx-bio/common/mock-data'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { Controller } from '~/api-helper/types'
import { ApiClientError, ApiNotFoundError } from '~/errors'
import { filterMocksByParameters, filterMocksBySpecies } from '~/mock-helper'
import { assertParamsExist } from '~/validation'

export const spotlightDatasetController: Controller<SpotlightDatasetResponse, spotlightDatasetParams, SpotlightDatasetQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  const { speciesId, startDate, endDate, ...filter } = req.query
  console.log('\n----------------------')
  console.log(startDate, endDate)
  console.log(dayjs.utc(startDate).isValid(), dayjs.utc(endDate).isValid())
  console.log('\n----------------------')
  if (!isNumber(speciesId)) throw ApiClientError()
  if (!isDate(startDate)) throw ApiClientError()
  if (!isDate(endDate)) throw ApiClientError()

  const species = rawSpecies.find(s => s.speciesId === speciesId)
  if (!species) throw ApiNotFoundError()

  // Query
  const response = await getSpotligthDatasetInformation({ startDate: dayjs(startDate), endDate: dayjs(endDate), ...filter }, projectId, species.speciesId)

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
