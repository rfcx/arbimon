import { requireEnv } from '~/env'

// TODO: This should be injected by the script controller
const { IUCN_BASE_URL } = requireEnv('IUCN_BASE_URL')

const getGenusName = (scientificName: string): string => {
  return scientificName.split(' ')[0]
}

const getSpeciesName = (scientificName: string): string => {
  return scientificName.split(' ')[1]
}

export const getSpeciesApiRedirectLink = (scientificName: string): string =>
  `${IUCN_BASE_URL}/taxa/scientific_name?genus_name=${encodeURIComponent(getGenusName(scientificName))}&species_name=${encodeURIComponent(getSpeciesName(scientificName))}`
