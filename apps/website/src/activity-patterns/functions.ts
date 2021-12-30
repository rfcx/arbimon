import { Dayjs } from 'dayjs'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { FileData, toCsv, zipAndDownload } from '@rfcx-bio/utils/file'

import { ActivityPatternsData, ActivityPatternsDataByExport } from '~/api/activity-patterns-service'
import { getCSVDatasetMetadata } from '~/export'
import { ColoredFilter, DatasetParameters, getExportDateTime, getExportFilterName, getExportGroupName } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { Metrics } from './types'

export type ActivityPatternsDataBySites = ActivityPatternsData & DatasetParameters

export const ACTIVITY_PATTERN_MAP_KEYS = {
  detection: 'detection',
  detectionFrequency: 'detectionFrequency',
  occupancy: 'occupancy'
}

export interface JSONBase {
  detections: number
  detection_frequency: number
}

export interface MonthJson extends JSONBase {
  month: string
}

export interface YearJson extends JSONBase {
  year: string
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

export async function exportDetectionCSV (filters: ColoredFilter[], datasets: ActivityPatternsDataByExport[], reportPrefix: string): Promise<void> {
  const exportDateTime = getExportDateTime()
  const groupName = getExportGroupName(reportPrefix, exportDateTime)

  const hourFiles: FileData[] = await Promise.all(
    filters.map(async ({ startDate, endDate, sites }, idx) => {
      const filename = `${getExportFilterName(startDate, endDate, reportPrefix, idx, exportDateTime, sites)}-h.csv`
      const data = await getHourCSVData(datasets[idx])
      return { filename, data }
    })
  )

  const monthFiles: FileData[] = await Promise.all(
    filters.map(async ({ startDate, endDate, sites }, idx) => {
      const filename = `${getExportFilterName(startDate, endDate, reportPrefix, idx, exportDateTime, sites)}-m.csv`
      const data = await getMonthCSVData(datasets[idx])
      return { filename, data }
    })
  )

  const yearFiles: FileData[] = await Promise.all(
    filters.map(async ({ startDate, endDate, sites }, idx) => {
      const filename = `${getExportFilterName(startDate, endDate, reportPrefix, idx, exportDateTime, sites)}-y.csv`
      const data = await getYearCSVData(datasets[idx])
      return { filename, data }
    })
  )

  const metadataFile = await getCSVDatasetMetadata(filters)
  const files = [...hourFiles, ...monthFiles, ...yearFiles, metadataFile]
  await zipAndDownload(files, groupName)
}

export async function getHourCSVData (dataset: ActivityPatternsDataByExport): Promise<string> {
  const { detection, detectionFrequency } = dataset.hour
  const dataAsJson = Array.from(Array(23).keys()).map(n => ({
    hour: n,
    detections: detection[n] ?? 0,
    detection_frequency: detectionFrequency[n] ?? 0
  }))
  return await toCsv(dataAsJson)
}

export function getDateRange (currentDate: Dayjs, startRange: Dayjs, endRange: Dayjs, unit: 'month'|'year'): string[] {
  const ranges: string[] = []
  while (currentDate.isBefore(endRange) || currentDate.isSame(endRange)) {
    ranges.push(currentDate.format('MM/YYYY'))
    currentDate = currentDate.add(1, unit)
  }
  return ranges
}

export async function getMonthCSVData (dataset: ActivityPatternsDataByExport): Promise<string> {
  const { detection, detectionFrequency } = dataset.month
  const jsonFormatted = (monthKeys: string[]): MonthJson[] => {
    return monthKeys.map(month => ({
      month,
      detections: detection[month] ?? 0,
      detection_frequency: detectionFrequency[month] ?? 0
    }))
  }

  const monthKeys = Object.keys(detection)
  if (monthKeys.length === 1) {
    const dataAsJson = jsonFormatted(monthKeys)
    return await toCsv(dataAsJson)
  }

  const month = monthKeys.map(m => dayjs(m, 'MM/YYYY'))
  const startOfRange = dayjs.min(month)
  const endOfRange = dayjs.max(month)

  const currentDate = dayjs(startOfRange)
  const monthRanges = getDateRange(currentDate, startOfRange, endOfRange, 'month')

  const dataAsJson = monthRanges.map(month => ({
    month,
    detections: detection[month] ?? 0,
    detection_frequency: detectionFrequency[month] ?? 0
  }))
  return await toCsv(dataAsJson)
}

export async function getYearCSVData (dataset: ActivityPatternsDataByExport): Promise<string> {
  const { detection, detectionFrequency } = dataset.year
  const jsonFormatted = (yearKeys: string[]): YearJson[] => {
    return yearKeys.map(year => ({
      year,
      detections: detection[year] ?? 0,
      detection_frequency: detectionFrequency[year] ?? 0
    }))
  }

  const yearKeys = Object.keys(detection)
  if (yearKeys.length === 1) {
    const dataAsJson = jsonFormatted(yearKeys)
    return await toCsv(dataAsJson)
  }

  const month = yearKeys.map(y => dayjs(y, 'YYYY'))
  const startOfRange = dayjs.min(month)
  const endOfRange = dayjs.max(month)

  const currentDate = dayjs(startOfRange)
  const yearRanges = getDateRange(currentDate, startOfRange, endOfRange, 'year')

  const dataAsJson = yearRanges.map(year => ({
    year,
    detections: detection[year] ?? 0,
    detection_frequency: detectionFrequency[year] ?? 0
  }))
  return await toCsv(dataAsJson)
}
