export interface SpeciesInProject {
  locationProjectId: number
  taxonClassId: number
  taxonClassSlug: string
  taxonSpeciesId: number
  taxonSpeciesSlug: string
  scientificName: string
  commonName: string
  riskRatingIucnId: number
  photoUrl: string
}

export type SpeciesInProjectLight = Pick<SpeciesInProject,
  'taxonSpeciesId' |
  'taxonSpeciesSlug' |
  'scientificName' |
  'commonName' |
  'taxonClassSlug'
>
