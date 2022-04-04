import { AttributeConstants } from '../../type-helpers'

export interface DetectionByVersionSiteSpeciesHour {
  timePrecisionHourLocal: Date
  projectVersionId: number
  projectSiteId: number
  taxonSpeciesId: number
  taxonClassId: number
  detectionMinutes: number
  recordingMinutes: number
}

export const ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR: AttributeConstants<DetectionByVersionSiteSpeciesHour> = {
  pks: ['timePrecisionHourLocal', 'projectVersionId', 'projectSiteId', 'taxonSpeciesId'],
  updateOnDuplicate: ['taxonClassId', 'detectionMinutes', 'recordingMinutes']
}
