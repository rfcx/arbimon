import { env } from '../../../_services/env'

export const getSpeciesRedirectLink = (scientificName: string): string =>
  `${env.IUCN_BASE_URL}/website/${encodeURIComponent(scientificName)}`
