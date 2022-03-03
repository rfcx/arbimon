export type TimeBucket = 'hourOfDay' | 'dayOfWeek' | 'monthOfYear' | 'dateSeries'

export type SpeciesCountByTaxonName = Record<string, number>

export interface MapSiteData {
  siteName: string
  longitude: number
  latitude: number
  distinctSpecies: DistinctSpecies
}

// TODO 266 - Decouple maps
export interface DistinctSpecies {
  [key: string]: number | boolean
}
