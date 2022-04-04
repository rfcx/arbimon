export interface ProjectMetric {
  projectId: number
  detectionCount: number
  siteCount: number
  speciesCount: number
  maxDate: Date | null
  minDate: Date | null
}

export type ProjectMetricLight = Pick<ProjectMetric,
  'detectionCount' |
  'siteCount' |
  'speciesCount' |
  'maxDate' |
  'minDate'
>
