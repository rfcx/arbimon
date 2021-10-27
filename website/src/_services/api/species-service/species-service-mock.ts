import { groupBy, kebabCase, mapValues } from 'lodash'

import { getRawDetections, simulateDelay } from '~/api-helpers/mock'
import { Species } from '..'

export const getAllSpecies = async (): Promise<Species[]> => {
  const detectionsBySpeciesId = groupBy(getRawDetections(), 'species_id')
  const speciesBySpeciesId = mapValues(detectionsBySpeciesId, (value, key) => ({
    speciesSlug: kebabCase(value[0].scientific_name),
    speciesId: Number(key),
    speciesName: value[0].scientific_name,
    className: value[0].taxon
  }))
  return await simulateDelay(Object.values(speciesBySpeciesId))
}
