export interface DetectionsBySiteSpeciesHour {
  id: number
  locationSiteId: number
  taxonSpeciesId: number
  timeHourLocal: Date
  count: number
  durationMinutes: number
}
