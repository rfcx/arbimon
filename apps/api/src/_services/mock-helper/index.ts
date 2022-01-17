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

  // Strip time
  const startDateUtcInclusive = Temporal.Instant.from(startDateUtc)
    .toZonedDateTimeISO('UTC')
    .with({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    .toInstant()
    .toString()

  // Strip time & add 1 day to make it exclusive
  const endDateUtcExclusive = Temporal.Instant.from(endDateUtc)
    .toZonedDateTimeISO('UTC')
    .with({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    .add({ days: 1 })
    .toInstant()
    .toString()

  return detections.filter(r =>
    r.date >= startDateUtcInclusive &&
    r.date < endDateUtcExclusive &&
    (siteIds.length === 0 || siteIds.includes(r.stream_id)) &&
    (taxons.length === 0 || taxons.includes(r.taxon)) &&
    (speciesIds.length === 0 || speciesIds.includes(r.species_id))
  )
}

export const filterMocksBySpecies = (detections: MockHourlyDetectionSummary[], speciesId: number): MockHourlyDetectionSummary[] => {
  return detections.filter(r => r.species_id === speciesId)
}
