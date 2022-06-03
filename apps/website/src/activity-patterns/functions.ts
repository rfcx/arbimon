import { Dayjs } from 'dayjs'

import { SpotlightDatasetResponse, SpotlightDetectionDataBySite, SpotlightDetectionDataByTime, SpotlightExportData } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'
import { JsZipFile, toCsv, zipAndDownload } from '@rfcx-bio/utils/file'

import { getCSVDatasetMetadata } from '~/export'
import { DetectionFilter, getExportDateTime, getExportFilterName, getExportGroupName } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { Metrics } from './types'

export type SpotlightDataset = SpotlightDatasetResponse & DetectionFilter

export const SPOTLIGHT_MAP_KEYS = {
  detection: 'detection',
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
    const { totalRecordingCount, totalSiteCount, detectionCount, detectionFrequency, occupiedSiteCount, occupiedSiteFrequency } = dataset
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

export function transformToBySiteDataset (datasets: SpotlightDataset[]): MapDataSet[] {
  const maximumNumbers: Array<[number, number]> = datasets.map(({ detectionsByLocationSite }) => {
    const detectionsByLocationSiteValues = Object.values(detectionsByLocationSite)
    const siteDetectionCounts = detectionsByLocationSiteValues.map(({ siteDetectionCount }) => siteDetectionCount)
    const siteDetectionFrequencies = detectionsByLocationSiteValues.map(({ siteDetectionFrequency }) => siteDetectionFrequency)
    return [Math.max(0, ...siteDetectionCounts), Math.max(0, ...siteDetectionFrequencies)]
  })

  const maxValues = {
    detection: getPrettyMax(Math.max(0, ...maximumNumbers.map(m => m[0]))),
    detectionFrequency: getPrettyMax(Math.max(0, ...maximumNumbers.map(m => m[1])))
  }

  return datasets.map(({ dateStartLocal, dateEndLocal, siteGroups, detectionsByLocationSite }) => {
    const detectionsByLocationSiteValues = Object.values(detectionsByLocationSite)
    const data = detectionsByLocationSiteValues.map(({ siteName, latitude, longitude, siteDetectionCount, siteDetectionFrequency, siteOccupied }) => ({
      siteName,
      latitude,
      longitude,
      distinctSpecies: {
        [SPOTLIGHT_MAP_KEYS.detection]: siteDetectionCount,
        [SPOTLIGHT_MAP_KEYS.detectionFrequency]: siteDetectionFrequency,
        [SPOTLIGHT_MAP_KEYS.occupancy]: siteOccupied
      }
    }))

    const sites = siteGroups.flatMap(({ sites }) => sites)
    return { startDate: dateStartLocal, endDate: dateEndLocal, sites, data, maxValues }
  })
}

export async function exportDetectionCSV (filters: DetectionFilter[], datasets: SpotlightExportData[], reportPrefix: string): Promise<void> {
  const exportDateTime = getExportDateTime()
  const groupName = getExportGroupName(reportPrefix, exportDateTime)

  const hourFiles: JsZipFile[] = await Promise.all(
    filters.map(async ({ dateStartLocal, dateEndLocal, siteGroups }, idx) => {
      const filename = `${getExportFilterName(dateStartLocal, dateEndLocal, reportPrefix, idx, exportDateTime, siteGroups)}-h.csv`
      const data = await getHourCSVData(datasets[idx].hour)
      return { filename, data }
    })
  )

  const monthFiles: JsZipFile[] = await Promise.all(
    filters.map(async ({ dateStartLocal, dateEndLocal, siteGroups }, idx) => {
      const filename = `${getExportFilterName(dateStartLocal, dateEndLocal, reportPrefix, idx, exportDateTime, siteGroups)}-m.csv`
      const data = await getMonthCSVData(dateStartLocal, dateEndLocal, datasets[idx].month)
      return { filename, data }
    })
  )

  const yearFiles: JsZipFile[] = await Promise.all(
    filters.map(async ({ dateStartLocal, dateEndLocal, siteGroups }, idx) => {
      const filename = `${getExportFilterName(dateStartLocal, dateEndLocal, reportPrefix, idx, exportDateTime, siteGroups)}-y.csv`
      const data = await getYearCSVData(dateStartLocal, dateEndLocal, datasets[idx].year)
      return { filename, data }
    })
  )

  const siteFiles: JsZipFile[] = await Promise.all(
    filters.map(async ({ dateStartLocal, dateEndLocal, siteGroups }, idx) => {
      const filename = `${getExportFilterName(dateStartLocal, dateEndLocal, reportPrefix, idx, exportDateTime, siteGroups)}-s.csv`
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

export async function getMonthCSVData (startDate: Dayjs, endDate: Dayjs, dataset: SpotlightDetectionDataByTime<string>): Promise<string> {
  const { detection, detectionFrequency } = dataset
  const monthRanges = getDateRange(startDate.startOf('month'), endDate.endOf('month'), 'month', 'MM/YYYY')
  const dataAsJson = monthRanges.map(monthString => {
    return {
      monthString,
      detections: detection[monthString] ?? 0,
      detection_frequency: detectionFrequency[monthString] ?? 0
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
        detections: site.siteDetectionCount,
        detection_frequency: site.siteDetectionFrequency
      }
    })
  return await toCsv(dataAsJson)
}
