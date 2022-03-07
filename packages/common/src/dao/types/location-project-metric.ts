export interface LocationProjectMetric {
  locationProjectId: number
  detectionCount: number
  siteCount: number
  speciesCount: number
  maxDate: Date | string
  minDate: Date | string
}

export type LocationProjectMetricLight = Pick<LocationProjectMetric,
  'detectionCount' |
  'siteCount' |
  'speciesCount' |
  'maxDate' |
  'minDate'
>
