export interface Metrics {
  detectionCount: number
  siteCount: number
  speciesCount: number
  endangeredSpecies: number
}

export interface DashboardGeneratedResponse {
  metrics: Metrics
}
