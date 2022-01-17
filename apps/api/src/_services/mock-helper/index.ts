import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'
import { plainDate } from '@rfcx-bio/utils/datetime-temporal'

export interface FilterDataset {
  startDateUtc: string
  endDateUtc: string
  siteIds: string[]
  taxons: string[]
}

export const filterMocksByParameters = (detections: MockHourlyDetectionSummary[], datasetParams: FilterDataset, speciesIds: number[] = []): MockHourlyDetectionSummary[] => {
  const { startDateUtc, endDateUtc, siteIds, taxons } = datasetParams

  // Add 1 day to make it exclusive
  const endDateUtcExclusive = plainDate(endDateUtc).add({ days: 1 }).toString()

  return detections.filter(r =>
    r.date >= startDateUtc &&
    r.date < endDateUtcExclusive &&
    (siteIds.length === 0 || siteIds.includes(r.stream_id)) &&
    (taxons.length === 0 || taxons.includes(r.taxon)) &&
    (speciesIds.length === 0 || speciesIds.includes(r.species_id))
  )
}

export const filterMocksBySpecies = (detections: MockHourlyDetectionSummary[], speciesId: number): MockHourlyDetectionSummary[] => {
  return detections.filter(r => r.species_id === speciesId)
}
