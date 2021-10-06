import { groupBy, mapValues } from 'lodash'

import rawDetections from '@/api/raw-species-richness-data-01-07-apr-2021.json'

export function getSpecies (): string[] {
  const groupedDetections = groupBy(rawDetections, 'species_id')
  const data = mapValues(groupedDetections, (value, _) => value[0].scientific_name)
  return Object.values(data)
}
