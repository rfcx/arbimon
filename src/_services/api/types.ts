// TODO ?? - Are these properties really optional?!
export interface Project {
  id?: string
  name?: string
  isPublic?: boolean
  externalId?: number
}

export interface Site {
  siteId: string
  name: string
  latitude?: number
  longitude?: number
}

export interface Detection {
  arbimonSiteId: number
  siteId: string
  siteName: string
  latitude: number
  longitude: number
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
}
