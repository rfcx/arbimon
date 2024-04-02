/**
 * short type referenced to needed columns for manipulating the data
 * for opensearch. Just the needed columns, nothing more.
 */
export interface AbbreviatedProject {
  id: number
  name: string
  objectives: string[]
  country_codes: string[]
  image: string
}

export interface ExpandedProject extends AbbreviatedProject {
  expanded_country_names: string[]
  expanded_objectives: string[]
  species: ProjectSpecies[]
}

export interface ProjectSpecies {
  scientific_name: string
  common_name: string
  taxon_class: string
  is_threatened: boolean
  risk_rating_category?: string
  risk_rating?: string
  code?: string
  countries?: string[]
}
