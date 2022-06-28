import { attributes, AttributeTypes } from '../type-helpers'

export interface SpeciesInProject {
  locationProjectId: number
  taxonClassId: number
  taxonClassSlug: string
  taxonSpeciesId: number
  taxonSpeciesSlug: string
  scientificName: string
  description: string
  sourceUrl: string
  sourceCite: string
  riskRatingId: number
  riskRatingGlobalId: number
  riskRatingLocalId: number
  commonName?: string
  photoUrl?: string
}

export type SpeciesInProjectLight = Pick<SpeciesInProject,
  'taxonSpeciesId' |
  'taxonSpeciesSlug' |
  'scientificName' |
  'commonName' |
  'taxonClassSlug'
>

export const ATTRIBUTES_SPECIES_IN_PROJECT = attributes<SpeciesInProject>()({
  light: ['taxonSpeciesId', 'taxonSpeciesSlug', 'scientificName', 'commonName', 'taxonClassSlug']
})
