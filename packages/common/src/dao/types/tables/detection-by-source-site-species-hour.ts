import { AttributeConstants } from '../../type-helpers'

export interface DetectionBySourceSiteSpeciesHour {
  timePrecisionHourLocal: Date
  sourceId: number
  projectSiteId: number
  taxonSpeciesId: number
  projectId: number
  detectionMinutes: string // number[]
}

export const ATTRIBUTES_DETECTION_BY_SOURCE_SITE_SPECIES_HOUR: AttributeConstants<DetectionBySourceSiteSpeciesHour> = {
}
