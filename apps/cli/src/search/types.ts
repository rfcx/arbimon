export interface AbbreviatedProject {
  id: number
  name: string
  objectives: string[]
  country_codes: string[]
}

export interface ExpandedProject extends AbbreviatedProject {
  expanded_country_names: string[]
  expanded_objectives: string[]
}
