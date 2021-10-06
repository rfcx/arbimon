import { groupBy, mapValues } from 'lodash'

import rawDetections from '@/api/raw-species-richness-data-01-07-apr-2021.json'
import { TaxonomyModels } from '@/models'

export function getSpecies (): TaxonomyModels.Species[] {
  const groupedDetections = groupBy(rawDetections, 'species_id')
  const data = mapValues(groupedDetections, (value, key) => ({
    speciesId: Number(key),
    speciesName: value[0].scientific_name
  }))
  return Object.values(data)
}
