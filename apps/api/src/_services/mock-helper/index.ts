import { groupBy, mapValues } from 'lodash-es'

import { FilterDatasetQuery } from '@rfcx-bio/common/api-bio/common/filter'
import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

export const filterMocksByParameters = (detections: MockHourlyDetectionSummary[], datasetParams: FilterDatasetQuery): MockHourlyDetectionSummary[] => {
  const { startDate, endDate, siteIds, filterBy } = datasetParams
  const start = startDate.toISOString()
  const end = endDate.add(1, 'day').toISOString()

  // TODO - Extract this to UI filter package
  const propertyEqualFilters = mapValues(groupBy(filterBy, 'propertyName'), f => f.map(v => v.value))
  const taxons = propertyEqualFilters.taxon ?? []
  const species = propertyEqualFilters.species ?? []

  // TODO - Move to API
  return detections.filter(r =>
    r.date >= start &&
    r.date < end &&
    (siteIds.length === 0 || siteIds.includes(r.stream_id)) &&
    (taxons.length === 0 || taxons.includes(r.taxon)) &&
    (species.length === 0 || species.includes(r.species_id.toString()))
  )
}
