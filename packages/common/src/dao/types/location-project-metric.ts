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
