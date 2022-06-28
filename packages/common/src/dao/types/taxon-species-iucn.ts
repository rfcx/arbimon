export interface TaxonSpeciesIucn {
  taxonSpeciesId: number
  commonName: string
  riskRatingIucnId: number
  description: string
  descriptionSourceUrl: string
}

export const ATTRIBUTES_TAXON_SPECIES_IUCN: Record<string, Array<keyof TaxonSpeciesIucn>> = {
}
