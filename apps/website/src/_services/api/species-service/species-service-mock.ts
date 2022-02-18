import { Species, SpeciesLight } from '@rfcx-bio/common/api-bio/species/types'
import { rawSpecies, simulateDelay } from '@rfcx-bio/common/mock-data'

export const getAllSpecies = async (): Promise<SpeciesLight[]> => await simulateDelay(
  rawSpecies.map(({ speciesId, speciesSlug, scientificName, commonName, taxon }) =>
    ({ speciesId, speciesSlug, scientificName, commonName, taxon }))
)

export const getSpecies = async (scientificName: string): Promise<Species | undefined> => {
  return await simulateDelay(rawSpecies.find(s => s.scientificName === scientificName))
}
