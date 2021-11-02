export interface MetricsDataset {
  percentage: string
  description: string
  color?: string
}

export interface Metrics {
  title: string
  information: string
  datasets: MetricsDataset[]
}
