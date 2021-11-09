import { ActivityPatternsData } from '~/api/activity-patterns-service'
import { ColoredFilter } from '~/dataset-filters'
import { MapDataSet } from '~/maps/map-bubble'
import { Metrics } from './types'

export type ActivityPatternsDataBySites = ActivityPatternsData & ColoredFilter

const MAXIMUM_RADIUS = 5
const DATA_SCALE_RANGE = 5
export const ACTIVITY_PATTERN_MAP_KEYS = {
  detection: 'detection',
  detectionFrequency: 'detectionFrequency',
  occupancy: 'occupancy'
}

export function transformToMetricsDatasets (datasets: ActivityPatternsData[]): Metrics[] {
  const metrics: Metrics[] = [
    {
      title: 'Detection frequency',
      information: 'Number of recordings with detections divided by the total number of recordings',
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
      value: detectionFrequency,
      description: `Found in ${detectionCount.toLocaleString()} out of ${totalRecordingCount.toLocaleString()} recordings`
    })
    metrics[1].datasets.push({
      value: occupiedSiteFrequency,
      description: `Found in ${occupiedSiteCount.toLocaleString()} out of ${totalSiteCount.toLocaleString()} sites`
    })
  })

  return metrics
}

function getDataRangeFromMaxNumber (maxNumber: number): number[] {
  if (maxNumber === 0) {
    return [0]
  }
  const scaleGap = Math.ceil(maxNumber / DATA_SCALE_RANGE)
  return [...Array(DATA_SCALE_RANGE).keys()].map(n => n * scaleGap)
}

export function transformToBySiteDataset (datasets: ActivityPatternsDataBySites[]): MapDataSet[] {
  const maximumNumbers = datasets.map(({ activityBySite }) => {
    const activityBySiteValues = Object.values(activityBySite)
    const siteDetectionCounts = activityBySiteValues.map(({ siteDetectionCount }) => siteDetectionCount)
    const siteDetectionFrequencies = activityBySiteValues.map(({ siteDetectionFrequency }) => siteDetectionFrequency * 100)
    return [Math.max(0, ...siteDetectionCounts), Math.max(0, ...siteDetectionFrequencies)]
  })

  const maximumSiteDetectionCount = Math.max(0, ...maximumNumbers.map(m => m[0]))
  const maximumSiteDetectionFrequency = Math.max(0, ...maximumNumbers.map(m => m[1]))

  return datasets.map(({ startDate, endDate, sites, color, activityBySite }) => {
    const activityBySiteValues = Object.values(activityBySite)
    const data = activityBySiteValues.map(({ siteName, latitude, longitude, siteDetectionCount, siteDetectionFrequency, siteOccupied }) => ({
      siteName,
      latitude,
      longitude,
      distinctSpecies: {
        [ACTIVITY_PATTERN_MAP_KEYS.detection]: siteDetectionCount,
        [ACTIVITY_PATTERN_MAP_KEYS.detectionFrequency]: siteDetectionFrequency * 100,
        [ACTIVITY_PATTERN_MAP_KEYS.occupancy]: siteOccupied
      }
    }))

    const dataRange = {
      [ACTIVITY_PATTERN_MAP_KEYS.detection]: getDataRangeFromMaxNumber(maximumSiteDetectionCount),
      [ACTIVITY_PATTERN_MAP_KEYS.detectionFrequency]: getDataRangeFromMaxNumber(maximumSiteDetectionFrequency)
    }

    return { startDate, endDate, sites, color, data, dataRange, maximumRadius: MAXIMUM_RADIUS }
  })
}
