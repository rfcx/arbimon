import { ActivityPatternsData } from '~/api/activity-patterns-service'
import { ColoredFilter } from '~/dataset-filters'
import { Metrics } from './types'

export function transformToMetricsDatasets (datasets: Array<ColoredFilter & { data: ActivityPatternsData }>): Metrics[] {
  const metrics: Metrics[] = [
    {
      title: 'Detection frequency',
      information: 'Number of recordings as a proportion of total recordings',
      datasets: []
    },
    {
      title: 'Occupancy',
      information: 'Number of sites with a detection',
      datasets: []
    }
  ]

  for (const dataset of datasets) {
    const { totalSiteCount, totalRecordingCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency } = dataset.data
    metrics[0].datasets.push({
      percentage: Number((detectionFrequency * 100).toFixed(0)),
      description: `Found in ${detectionCount} recordings out of ${totalRecordingCount} recordings`,
      color: dataset.color
    })
    metrics[1].datasets.push({
      percentage: Number((occupiedSiteFrequency * 100).toFixed(0)),
      description: `Found in ${occupiedSiteCount} sites out of ${totalSiteCount} sites`,
      color: dataset.color
    })
  }

  return metrics
}
