import { FileData, toCsv, zipAndDownload } from '@rfcx-bio/utils/file'

import { TimeDataset } from '@/activity-overview/types'
import { ActivityPatternsData } from '~/api/activity-patterns-service'
import { ColoredFilter, DatasetParameters, getExportDateTime, getExportFilterName, getExportGroupName } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { Metrics } from './types'

export type ActivityPatternsDataBySites = ActivityPatternsData & DatasetParameters

export const ACTIVITY_PATTERN_MAP_KEYS = {
  detection: 'detection',
  detectionFrequency: 'detectionFrequency',
  occupancy: 'occupancy'
}

export function transformToMetricsDatasets (datasets: ActivityPatternsData[]): Metrics[] {
  const metrics: Metrics[] = [
    {
      title: 'Detection Frequency',
      information: 'Number of detections ÷<br />Total number of recordings',
      datasets: []
    },
    {
      title: 'Naive Occupancy',
      information: 'Number of sites with detections ÷<br />Total number of sites',
      datasets: []
    }
  ]

  datasets.forEach(({ totalRecordingCount, totalSiteCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency }) => {
    metrics[0].datasets.push({
      value: detectionFrequency.toFixed(3),
      description: `Found in ${detectionCount.toLocaleString()} out of ${totalRecordingCount.toLocaleString()} recordings`
    })
    metrics[1].datasets.push({
      value: occupiedSiteFrequency.toFixed(3),
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

  return datasets.map(({ startDate, endDate, sites, activityBySite }) => {
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

    return { startDate, endDate, sites, data, maxValues }
  })
}

export async function exportDetectionCSV (filters: ColoredFilter[], datasets: TimeDataset[], reportPrefix: string): Promise<void> {
  const exportDateTime = getExportDateTime()
  const groupName = getExportGroupName(reportPrefix, exportDateTime)

  const files: FileData[] = await Promise.all(
    filters.map(async ({ startDate, endDate, sites }, idx) => {
      const filename = getExportFilterName(startDate, endDate, reportPrefix, exportDateTime, sites.flatMap(sg => sg.value)) + '.csv'
      const data = await getCSVData(datasets[idx])
      return { filename, data }
    })
  )

  await zipAndDownload(files, groupName)
}

export async function getCSVData (dataset: TimeDataset): Promise<string> {
  const detection = dataset.data.hourOfDay.detection
  const dataAsJson = Array.from(Array(23).keys()).map(n => ({
    hour: n,
    detections: detection[n] ?? 0
  }))
  return await toCsv(dataAsJson)
}
