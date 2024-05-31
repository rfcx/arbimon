import { type AttributeTypes, attributes } from '../type-helpers'

export interface DetectionBySiteSpeciesHour {
  timePrecisionHourLocal: Date
  locationSiteId: number
  taxonSpeciesId: number
  locationProjectId: number
  taxonClassId: number
  count: number
  countsByMinute: number[][]
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR = attributes<DetectionBySiteSpeciesHour>()({
})

export type DetectionBySiteSpeciesHourTypes = AttributeTypes< DetectionBySiteSpeciesHour, typeof ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR>
