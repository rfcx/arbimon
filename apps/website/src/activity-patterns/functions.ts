import { Dayjs } from 'dayjs'

import { SpotlightDatasetResponse, SpotlightDetectionDataBySite, SpotlightDetectionDataByTime, SpotlightExportData } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { JsZipFile, toCsv, zipAndDownload } from '@rfcx-bio/utils/file'

import { getCSVDatasetMetadata } from '~/export'
import { ColoredFilter, DatasetParameters, getExportDateTime, getExportFilterName, getExportGroupName } from '~/filters'
import { MapDataSet } from '~/maps/types'
import { Metrics } from './types'

export type SpotlightDataset = SpotlightDatasetResponse & DatasetParameters

export const SPOTLIGHT_MAP_KEYS = {
  count: 'count',
  detectionFrequency: 'detectionFrequency',
  occupancy: 'occupancy'
}

export function transformToMetricsDatasets (datasets: SpotlightDataset[]): Metrics[] {
  const metrics: Metrics[] = [
    {
      title: 'Detection Frequency',
      information: 'Number of detections ÷ \nTotal number of recordings',
      datasets: []
    },
    {
      title: 'Naive Occupancy',
      information: 'Number of sites with detections ÷ \nTotal number of sites',
      datasets: []
    }
  ]

  datasets.forEach(dataset => {
    const { recordedMinutesCount, totalSiteCount, detectionMinutesCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency } = dataset
    metrics[0].datasets.push({
      value: detectionFrequency.toFixed(3),
      description: `Found in ${detectionMinutesCount.toLocaleString()} out of ${recordedMinutesCount.toLocaleString()} recorded minutes`
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

export function transformToBySiteDataset (datasets: SpotlightDataset[]): MapDataSet[] {
  const maximumNumbers: Array<[number, number]> = datasets.map(({ detectionsByLocationSite }) => {
    const detectionsByLocationSiteValues = Object.values(detectionsByLocationSite)
    const siteDetectionMinutesCounts = detectionsByLocationSiteValues.map(({ siteDetectionMinutesCount }) => siteDetectionMinutesCount)
    const siteDetectionFrequencies = detectionsByLocationSiteValues.map(({ siteDetectionFrequency }) => siteDetectionFrequency)
    return [Math.max(0, ...siteDetectionMinutesCounts), Math.max(0, ...siteDetectionFrequencies)]
  })

  const maxValues = {
    detection: getPrettyMax(Math.max(0, ...maximumNumbers.map(m => m[0]))),
    detectionFrequency: getPrettyMax(Math.max(0, ...maximumNumbers.map(m => m[1])))
  }

  return datasets.map(({ startDate, endDate, sites, detectionsByLocationSite }) => {
    const detectionsByLocationSiteValues = Object.values(detectionsByLocationSite)
    const data = detectionsByLocationSiteValues.map(({ siteName, latitude, longitude, siteDetectionMinutesCount, siteDetectionFrequency, siteOccupied }) => ({
      siteName,
      latitude,
      longitude,
      values: {
        [SPOTLIGHT_MAP_KEYS.count]: siteDetectionMinutesCount,
        [SPOTLIGHT_MAP_KEYS.detectionFrequency]: siteDetectionFrequency,
        [SPOTLIGHT_MAP_KEYS.occupancy]: siteOccupied
      }
    }))

    return { startDate, endDate, sites, data, maxValues }
  })
}

export async function exportDetectionCSV (filters: ColoredFilter[], datasets: SpotlightExportData[], reportPrefix: string): Promise<void> {
  const exportDateTime = getExportDateTime()
  const groupName = getExportGroupName(reportPrefix, exportDateTime)

  const hourFiles: JsZipFile[] = await Promise.all(
    filters.map(async ({ startDate, endDate, sites }, idx) => {
      const filename = `${getExportFilterName(startDate, endDate, reportPrefix, idx, exportDateTime, sites)}-h.csv`
      const data = await getHourCSVData(datasets[idx].hour)
      return { filename, data }
    })
  )

  const monthFiles: JsZipFile[] = await Promise.all(
    filters.map(async ({ startDate, endDate, sites }, idx) => {
      const filename = `${getExportFilterName(startDate, endDate, reportPrefix, idx, exportDateTime, sites)}-m.csv`
      const data = await getMonthCSVData(startDate, endDate, datasets[idx].month)
      return { filename, data }
    })
  )

  const yearFiles: JsZipFile[] = await Promise.all(
    filters.map(async ({ startDate, endDate, sites }, idx) => {
      const filename = `${getExportFilterName(startDate, endDate, reportPrefix, idx, exportDateTime, sites)}-y.csv`
      const data = await getYearCSVData(startDate, endDate, datasets[idx].year)
      return { filename, data }
    })
  )

  const siteFiles: JsZipFile[] = await Promise.all(
    filters.map(async ({ startDate, endDate, sites }, idx) => {
      const filename = `${getExportFilterName(startDate, endDate, reportPrefix, idx, exportDateTime, sites)}-s.csv`
      const data = await getSiteCSVData(datasets[idx].sites)
      return { filename, data }
    })
  )

  const metadataFile = await getCSVDatasetMetadata(filters)
  const files = [...hourFiles, ...monthFiles, ...yearFiles, ...siteFiles, metadataFile]
  await zipAndDownload(files, groupName)
}

export async function getHourCSVData (dataset: SpotlightDetectionDataByTime): Promise<string> {
  const { detection, detectionFrequency } = dataset
  const dataAsJson = Array.from({ length: 24 }, (_, idx) => ({
    hour: idx,
    detections: detection[idx] ?? 0,
    detection_frequency: detectionFrequency[idx] ?? 0
  }))
  return await toCsv(dataAsJson)
}

export function getDateRange (startRange: Dayjs, endRange: Dayjs, unit: 'month'|'year', format: string): string[] {
  let currentDate = startRange
  const ranges: string[] = []
  while (currentDate.isBefore(endRange) || currentDate.isSame(endRange)) {
    ranges.push(currentDate.format(format))
    currentDate = currentDate.add(1, unit)
  }
  return ranges
}

export async function getMonthCSVData (startDate: Dayjs, endDate: Dayjs, dataset: SpotlightDetectionDataByTime): Promise<string> {
  const { detection, detectionFrequency } = dataset
  const monthRanges = getDateRange(startDate.startOf('month'), endDate.endOf('month'), 'month', 'MM/YYYY')
  const dataAsJson = monthRanges.map(monthString => {
    const month = Number(monthString)
    return {
      month,
      detections: detection[month] ?? 0,
      detection_frequency: detectionFrequency[month] ?? 0
    }
  })
  return await toCsv(dataAsJson)
}

export async function getYearCSVData (startDate: Dayjs, endDate: Dayjs, dataset: SpotlightDetectionDataByTime): Promise<string> {
  const { detection, detectionFrequency } = dataset
  const yearRanges = getDateRange(startDate.startOf('year'), endDate.endOf('year'), 'year', 'YYYY')
  const dataAsJson = yearRanges.map(yearString => {
    const year = Number(yearString)
    return {
      year,
      detections: detection[year] ?? 0,
      detection_frequency: detectionFrequency[year] ?? 0
    }
  })
  return await toCsv(dataAsJson)
}

export async function getSiteCSVData (dataset: SpotlightDetectionDataBySite): Promise<string> {
  const datasetSiteIdsNumber = Object.keys(dataset).map(key => parseInt(key))
  const dataAsJson = datasetSiteIdsNumber
    .sort((a, b) => {
      const site1 = dataset[a]
      const site2 = dataset[b]
      return site1.siteName.localeCompare(site2.siteName) || site1.siteId - site2.siteId
    })
    .map(siteId => {
      const site = dataset[siteId]
      return {
        site: site.siteName,
        site_id: siteId,
        detections: site.siteDetectionMinutesCount,
        detection_frequency: site.siteDetectionFrequency
      }
    })
  return await toCsv(dataAsJson)
}
