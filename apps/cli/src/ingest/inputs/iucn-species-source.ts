export const getIucnSpeciesSourceUrl = (iucnBaseUrl: string, scientificName: string): string =>
  `${iucnBaseUrl}/website/${encodeURIComponent(scientificName)}`

export const IUCN_SOURCE_CITATION = 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)'
