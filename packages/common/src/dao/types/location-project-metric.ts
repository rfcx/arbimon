import { attributes, AttributeTypes } from '../type-helpers'

export interface LocationProjectMetric {
  locationProjectId: number
  detectionCount: number
  siteCount: number
  speciesCount: number
  maxDate: Date | null
  minDate: Date | null
}

export type LocationProjectMetricLight = Pick<LocationProjectMetric,
  'detectionCount' |
  'siteCount' |
  'speciesCount' |
  'maxDate' |
  'minDate'
>

export const ATTRIBUTES_LOCATION_PROJECT_METRIC = attributes<LocationProjectMetric>()({
  light: ['detectionCount', 'siteCount', 'speciesCount', 'maxDate', 'minDate']
})
