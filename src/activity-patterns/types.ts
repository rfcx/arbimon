export interface MetricsDataset {
  percentage: number
  description: string
  color?: string
}

export interface Metrics {
  title: string
  information: string
  datasets: MetricsDataset[]
}
