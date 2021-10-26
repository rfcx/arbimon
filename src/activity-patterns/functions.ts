import { ActivityPatternsData } from '~/api/activity-patterns-service'
import { ColoredFilter } from '~/dataset-filters'
import { Metrics } from './types'

export function transformToMetricsDatasets (datasets: Array<ColoredFilter & { data: ActivityPatternsData }>): Metrics[] {
  const metrics: Metrics[] = [
    {
      title: 'Detection frequency',
      information: 'Number of detections as a proportion of total recordings',
      datasets: []
    },
    {
      title: 'Occupancy ratio',
      information: 'Number of sites with detection by the total number of sites',
      datasets: []
    }
  ]

  for (const dataset of datasets) {
    const { totalRecordingCount, totalSiteCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency } = dataset.data
    metrics[0].datasets.push({
      percentage: (detectionFrequency * 100).toFixed(1),
      description: `Found in ${detectionCount.toLocaleString()} recordings out of ${totalRecordingCount.toLocaleString()} recordings`,
      color: dataset.color
    })
    metrics[1].datasets.push({
      percentage: (occupiedSiteFrequency * 100).toFixed(1),
      description: `Found in ${occupiedSiteCount.toLocaleString()} sites out of ${totalSiteCount.toLocaleString()} sites`,
      color: dataset.color
    })
  }

  return metrics
}
