export type TimeBucket = 'hourOfDay' | 'dayOfWeek' | 'monthOfYear' | 'dateSeries'

export interface MapSiteData {
  siteName: string
  longitude: number
  latitude: number
  // TODO 266 - Decouple maps
  distinctSpecies: { [key: string]: number | boolean }
}

export type SpeciesCountByTaxonName = Record<string, number>
