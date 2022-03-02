export interface LocationProjectMetric {
  locationProjectId: number
  detectionCount: number
  siteCount: number
  speciesCount: number
}

export type LocationProjectMetricLight = Pick<LocationProjectMetric,
  'detectionCount' |
  'siteCount' |
  'speciesCount'
>
