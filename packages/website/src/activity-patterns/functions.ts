import { ActivityPatternsData } from '~/api/activity-patterns-service'
import { Metrics } from './types'

export type ActivityPatternsDataBySites = ActivityPatternsData & { color: string }

export function transformToMetricsDatasets (datasets: ActivityPatternsData[]): Metrics[] {
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

  datasets.forEach(({ totalRecordingCount, totalSiteCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency }) => {
    metrics[0].datasets.push({
      percentage: (detectionFrequency * 100).toFixed(1),
      description: `Found in ${detectionCount.toLocaleString()} out of ${totalRecordingCount.toLocaleString()} recordings`
    })
    metrics[1].datasets.push({
      percentage: (occupiedSiteFrequency * 100).toFixed(1),
      description: `Found in ${occupiedSiteCount.toLocaleString()} out of ${totalSiteCount.toLocaleString()} sites`
    })
  })

  return metrics
}

// TODO Nutto: Update here
export function transformToBySiteDataset (datasets: ActivityPatternsDataBySites[]): any {
  return datasets.map(({ start, end, sites, color, activityBySite }) => ({
    startDate: start,
    endDate: end,
    sites,
    color,
    data: activityBySite
  }))
}
