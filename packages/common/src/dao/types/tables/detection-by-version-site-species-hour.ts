import { AttributeConstants } from '../../type-helpers'

export interface DetectionByVersionSiteSpeciesHour {
  timePrecisionHourLocal: Date
  projectVersionId: number
  projectSiteId: number
  taxonSpeciesId: number
  taxonClassId: number
  countDetectionMinutes: number
}

export const ATTRIBUTES_DETECTION_BY_VERSION_SITE_SPECIES_HOUR: AttributeConstants<DetectionByVersionSiteSpeciesHour> = {
}
