import { attributes, AttributeTypes } from '../type-helpers'

export interface LocationProjectMetric {
  locationProjectId: number
  detectionMinutesCount: number
  speciesCount: number
  maxDate: Date | null
  minDate: Date | null
}

export const ATTRIBUTES_LOCATION_PROJECT_METRIC = attributes<LocationProjectMetric>()({
  light: ['detectionMinutesCount', 'speciesCount', 'maxDate', 'minDate']
})

export type LocationProjectMetricTypes = AttributeTypes< LocationProjectMetric, typeof ATTRIBUTES_LOCATION_PROJECT_METRIC>
