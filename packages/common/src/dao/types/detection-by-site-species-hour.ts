export interface DetectionBySiteSpeciesHour {
  timePrecisionHourLocal: Date
  locationSiteId: number
  taxonSpeciesId: number
  locationProjectId: number
  taxonClassId: number
  count: number
  durationMinutes: number
}

export const ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR: Record<string, Array<keyof DetectionBySiteSpeciesHour>> = {
  pks: ['timePrecisionHourLocal', 'locationSiteId', 'taxonSpeciesId'],
  updateOnDuplicate: ['locationProjectId', 'taxonClassId', 'count', 'durationMinutes']
}
