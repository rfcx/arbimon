import { ActivityPatternsData } from '~/api/activity-patterns-service'
import { ColoredFilter } from '~/dataset-filters'
import { useStore } from '~/store'
import { Metrics } from './types'

export function transformToMetricsDatasets (datasets: Array<ColoredFilter & { data: ActivityPatternsData }>): Metrics[] {
  const store = useStore()
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
    const { totalRecordingCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency } = dataset.data
    const totalSiteCount = dataset.sites.length === 0 ? store.sites.length : dataset.sites.length
    metrics[0].datasets.push({
      percentage: (detectionFrequency * 100).toFixed(1),
      description: `Found in ${detectionCount} recordings out of ${totalRecordingCount} recordings`,
      color: dataset.color
    })
    metrics[1].datasets.push({
      percentage: (occupiedSiteFrequency * 100).toFixed(1),
      description: `Found in ${occupiedSiteCount} sites out of ${totalSiteCount} sites`,
      color: dataset.color
    })
  }

  return metrics
}
