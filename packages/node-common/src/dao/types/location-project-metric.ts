import { type AttributeTypes, attributes } from '../type-helpers'

export interface LocationProjectMetric {
  locationProjectId: number
  speciesCount: number
  siteCount: number
  recordingMinutesCount: number
  detectionMinutesCount: number
  minDate: Date | null
  maxDate: Date | null
  recordingMinDate: Date | null
  recordingMaxDate: Date | null
  detectionMinDate: Date | null
  detectionMaxDate: Date | null
}

export const ATTRIBUTES_LOCATION_PROJECT_METRIC = attributes<LocationProjectMetric>()({
  light: ['recordingMinutesCount', 'detectionMinutesCount', 'speciesCount', 'siteCount', 'minDate', 'maxDate', 'recordingMinDate', 'recordingMaxDate', 'detectionMinDate', 'detectionMaxDate']
})

export type LocationProjectMetricTypes = AttributeTypes< LocationProjectMetric, typeof ATTRIBUTES_LOCATION_PROJECT_METRIC>
