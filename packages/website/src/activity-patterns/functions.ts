import { ActivityPatternsData } from '~/api/activity-patterns-service'
import { ColoredFilter } from '~/dataset-filters'
import { MapDataSet } from '~/maps/map-bubble'
import { Metrics } from './types'

export type ActivityPatternsDataBySites = ActivityPatternsData & ColoredFilter

const MAXIMUM_RADIUS = 5
const DATA_SCALE_RANGE = 5

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
        detection: siteDetectionCount,
        'detection-frequency': siteDetectionFrequency * 100,
        occupancy: siteOccupied
      }
    }))

    const dataRange = {
      detection: getDataRangeFromMaxNumber(maximumSiteDetectionCount),
      'detection-frequency': getDataRangeFromMaxNumber(maximumSiteDetectionFrequency)
    }

    return { startDate, endDate, sites, color, data, dataRange, maximumRadius: MAXIMUM_RADIUS }
  })
}
