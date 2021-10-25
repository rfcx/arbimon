export interface MetricsDataset {
  value: number
  description: string
}

export interface Metrics {
  title: string
  information: string
  datasets: MetricsDataset[]
}
