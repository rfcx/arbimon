import { FilterDataset } from '@rfcx-bio/common/api-bio/common/filter'
import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

export const filterMocksByParameters = (detections: MockHourlyDetectionSummary[], datasetParams: FilterDataset, speciesIds: number[] = []): MockHourlyDetectionSummary[] => {
  const { startDate, endDate, siteIds, taxons } = datasetParams
  const start = startDate.toISOString()
  const end = endDate.add(1, 'day').toISOString()

  return detections.filter(r =>
    r.date >= start &&
    r.date < end &&
    (siteIds.length === 0 || siteIds.includes(r.stream_id)) &&
    (taxons.length === 0 || taxons.includes(r.taxon)) &&
    (speciesIds.length === 0 || speciesIds.includes(r.species_id))
  )
}

export const filterMocksBySpecies = (detections: MockHourlyDetectionSummary[], speciesId: number): MockHourlyDetectionSummary[] => {
  return detections.filter(r => r.species_id === speciesId)
}
