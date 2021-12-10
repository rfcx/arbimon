export interface Detection {
  arbimonSiteId: number
  siteId: string
  siteName: string
  latitude: number
  longitude: number
  altitude: number
  date: string
  hour: number
  speciesId: number
  speciesName: string
  classId: number
  className: string
  detectionFrequency: number
}

export interface TaxonomyClass {
  symbol: string
  name: string
  color?: string
}

export interface Species {
  speciesSlug: string
  speciesId: number
  speciesName: string
  className: string
}

export interface DatasetDefinition {
  sites: Site[]
  start: string
  end: string
  otherFilters: FilterPropertyEquals[]
}

export type FilterableProperty = 'taxon' | 'species'

export interface FilterPropertyEquals {
  propertyName: FilterableProperty
  value: string
}
