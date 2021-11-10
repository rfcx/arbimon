import { ActivityPatternsData } from '~/api/activity-patterns-service'
import { ColoredFilter } from '~/dataset-filters'
import { MapDataSet } from '~/maps/map-bubble'
import { Metrics } from './types'

export type ActivityPatternsDataBySites = ActivityPatternsData & ColoredFilter

export const ACTIVITY_PATTERN_MAP_KEYS = {
  detection: 'detection',
  detectionFrequency: 'detectionFrequency',
  occupancy: 'occupancy'
}

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

function getPrettyMax (max: number): number {
  return max // TODO URGENT - Make this more pretty
}

export function transformToBySiteDataset (datasets: ActivityPatternsDataBySites[]): MapDataSet[] {
  const maximumNumbers: Array<[number, number]> = datasets.map(({ activityBySite }) => {
    const activityBySiteValues = Object.values(activityBySite)
    const siteDetectionCounts = activityBySiteValues.map(({ siteDetectionCount }) => siteDetectionCount)
    const siteDetectionFrequencies = activityBySiteValues.map(({ siteDetectionFrequency }) => siteDetectionFrequency)
    return [Math.max(0, ...siteDetectionCounts), Math.max(0, ...siteDetectionFrequencies)]
  })

  const maxValues = {
    detection: getPrettyMax(Math.max(0, ...maximumNumbers.map(m => m[0]))),
    detectionFrequency: getPrettyMax(Math.max(0, ...maximumNumbers.map(m => m[1])))
  }

  return datasets.map(({ startDate, endDate, sites, color, activityBySite }) => {
    const activityBySiteValues = Object.values(activityBySite)
    const data = activityBySiteValues.map(({ siteName, latitude, longitude, siteDetectionCount, siteDetectionFrequency, siteOccupied }) => ({
      siteName,
      latitude,
      longitude,
      distinctSpecies: {
        [ACTIVITY_PATTERN_MAP_KEYS.detection]: siteDetectionCount,
        [ACTIVITY_PATTERN_MAP_KEYS.detectionFrequency]: siteDetectionFrequency,
        [ACTIVITY_PATTERN_MAP_KEYS.occupancy]: siteOccupied
      }
    }))

    return { startDate, endDate, sites, color, data, maxValues }
  })
}
