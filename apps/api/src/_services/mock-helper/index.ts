import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

import { FilterDataset } from '../datasets/dataset-types'
import { dayjs } from '../dayjs-initialized'

export const filterMocksByParameters = (detections: MockHourlyDetectionSummary[], datasetParams: FilterDataset, speciesIds: number[] = []): MockHourlyDetectionSummary[] => {
  const { startDateUtcInclusive, endDateUtcInclusive, siteIds, taxons } = datasetParams

  // Add 1 day to make it exclusive
  const endDateUtcExclusive = dayjs.utc(endDateUtcInclusive).add(1, 'day').toISOString()

  return detections.filter(r =>
    r.date >= startDateUtcInclusive &&
    r.date < endDateUtcExclusive &&
    (siteIds.length === 0 || siteIds.includes(r.site_id)) &&
    (taxons.length === 0 || taxons.includes(r.taxon)) &&
    (speciesIds.length === 0 || speciesIds.includes(r.species_id))
  )
}

export const filterMocksBySpecies = (detections: MockHourlyDetectionSummary[], speciesId: number): MockHourlyDetectionSummary[] => {
  return detections.filter(r => r.species_id === speciesId)
}
