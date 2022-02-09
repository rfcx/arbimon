export interface DetectionsBySiteSpeciesHour {
  timeHourLocal: Date
  locationProjectId: number
  locationSiteId: number
  taxonClassId: number
  taxonSpeciesId: number
  count: number
  durationMinutes: number
}
