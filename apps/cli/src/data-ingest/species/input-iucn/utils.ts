import { requireEnv } from '~/env'

// TODO: This should be injected by the script controller
const { IUCN_BASE_URL } = requireEnv('IUCN_BASE_URL')

export const getSpeciesRedirectLink = (scientificName: string): string =>
  `${IUCN_BASE_URL}/website/${encodeURIComponent(scientificName)}`
