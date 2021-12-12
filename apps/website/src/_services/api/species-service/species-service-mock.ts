import { SpeciesLight } from '@rfcx-bio/common/api-bio-types/species'
import { rawSpecies, simulateDelay } from '@rfcx-bio/common/mock-data'

export const getAllSpecies = async (): Promise<SpeciesLight[]> => await simulateDelay(
  rawSpecies.map(({ speciesId, speciesSlug, scientificName, commonName, taxon: taxonClass }) =>
    ({ speciesId, speciesSlug, scientificName, commonName, taxonClass }))
)
