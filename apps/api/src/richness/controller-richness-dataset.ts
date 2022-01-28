import { filterMocksByParameters } from '_services/mock-helper'
import { groupBy, mapValues } from 'lodash-es'

import { RichnessDatasetParams, RichnessDatasetQuery, RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { MockHourlyDetectionSummary, rawDetections } from '@rfcx-bio/common/mock-data'

import { Handler } from '../_services/api-helper/types'
import { assertInvalidQuery, assertParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'

export const RichnessHandler: Handler<RichnessDatasetResponse, RichnessDatasetParams, RichnessDatasetQuery> = async (req) => {
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

  return await getRichnessDatasetInformation(detections)
}

async function getRichnessDatasetInformation (detections: MockHourlyDetectionSummary[]): Promise<RichnessDatasetResponse> {
  return {
    detectionCount: detections.length,
    speciesByTaxon: getSpeciesByTaxon(detections)
  }
}

const calculateSpeciesRichness = (detections: MockHourlyDetectionSummary[]): number => new Set(detections.map(d => d.species_id)).size

const getSpeciesByTaxon = (detections: MockHourlyDetectionSummary[]): { [taxon: string]: number } => {
  const detectionsByTaxon = groupBy(detections, 'taxon')
  return mapValues(detectionsByTaxon, calculateSpeciesRichness)
}
