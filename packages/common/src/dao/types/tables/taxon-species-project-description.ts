import { AttributeConstants } from '../../type-helpers'

export interface TaxonSpeciesProjectDescription {
  taxonSpeciesId: number
  projectId: number
  description: string
}

export const ATTRIBUTES_TAXON_SPECIES_PROJECT_DESCRIPTION: AttributeConstants<TaxonSpeciesProjectDescription> = {
  updateOnDuplicate: ['description']
}
