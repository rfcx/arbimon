import { Temporal } from '@js-temporal/polyfill'

import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

export interface FilterDataset {
  startDateUtc: string
  endDateUtc: string
  siteIds: string[]
  taxons: string[]
}

export const filterMocksByParameters = (detections: MockHourlyDetectionSummary[], datasetParams: FilterDataset, speciesIds: number[] = []): MockHourlyDetectionSummary[] => {
  const { startDateUtc, endDateUtc, siteIds, taxons } = datasetParams

  // Add 1 day to make it exclusive (slice to remove "Z" which PlainDateTime doesn't support)
  const endDateUtcExclusive = Temporal.PlainDate.from(endDateUtc.slice(0, -1)).add({ days: 1 }).toString()

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
