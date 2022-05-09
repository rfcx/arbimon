import { ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { JsZipFile, toCsv, zipAndDownload } from '@rfcx-bio/utils/file'

import { ActivityOverviewDataBySpecies } from '~/api/activity-overview-service'
import { getCSVDatasetMetadata } from '~/export'
import { DetectionFilter, getExportDateTime, getExportFilterName, getExportGroupName } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'

export type ActivityOverviewDataBySite = ActivityDatasetResponse & DetectionFilter

export const ACTIVITY_OVERVIEW_MAP_KEYS = {
  detection: 'detection',
  detectionFrequency: 'detectionFrequency',
  occupancy: 'occupancy'
}

function getPrettyMax (max: number): number {
  return max // TODO URGENT - Make this more pretty
}

export interface CsvData {
  'species name': string
  'taxonomy class': string
  'number of detections': number
  'detection frequency': number
  'number of occupied sites': number
  'naive occupancy': number
}

export function transformToBySiteDatasets (datasets: ActivityOverviewDataBySite[]): MapDataSet[] {
  const maximumNumbers: Array<[number, number]> = datasets.map(({ activityBySite }) => {
    const detectionCounts = activityBySite.map(({ detection }) => detection)
    const detectionFrequencies = activityBySite.map(({ detectionFrequency }) => detectionFrequency)
    return [Math.max(0, ...detectionCounts), Math.max(0, ...detectionFrequencies)]
  })

  const maxValues = {
    [ACTIVITY_OVERVIEW_MAP_KEYS.detection]: getPrettyMax(Math.max(0, ...maximumNumbers.map(m => m[0]))),
    [ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency]: getPrettyMax(Math.max(0, ...maximumNumbers.map(m => m[1])))
  }

  return datasets.map(({ dateStartLocal, dateEndLocal, siteGroups, activityBySite }) => {
    const sites = siteGroups.flatMap(({ sites }) => sites)
    const data = activityBySite.map(({ siteName, latitude, longitude, detection, detectionFrequency, occupancy }) => ({
      siteName,
      latitude,
      longitude,
      distinctSpecies: {
        [ACTIVITY_OVERVIEW_MAP_KEYS.detection]: detection,
        [ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency]: detectionFrequency,
        [ACTIVITY_OVERVIEW_MAP_KEYS.occupancy]: occupancy
      }
    }))
    return { startDate: dateStartLocal, endDate: dateEndLocal, sites, data, maxValues }
  })
}

export async function exportCSV (filters: DetectionFilter[], datasets: ActivityOverviewDataBySpecies[][], reportPrefix: string): Promise<void> {
  const sortedDatasets = datasets.map(dataset => {
    return dataset.sort((a, b) => a.scientificName.localeCompare(b.scientificName) ||
      a.taxon.localeCompare(b.taxon) ||
      a.detectionCount - b.detectionCount ||
      a.occupiedSites - b.occupiedSites)
  })

  const exportDateTime = getExportDateTime()
  const groupName = getExportGroupName(reportPrefix, exportDateTime)

  const files: JsZipFile[] = await Promise.all(
    filters.map(async ({ dateStartLocal, dateEndLocal, siteGroups }, idx) => {
      const filename = getExportFilterName(dateStartLocal, dateEndLocal, reportPrefix, idx, exportDateTime, siteGroups) + '.csv'
      const data = await getCSVData(sortedDatasets[idx])
      return { filename, data }
    })
  )

  const metadataFile = await getCSVDatasetMetadata(filters)
  files.push(metadataFile)

  await zipAndDownload(files, groupName)
}

export async function getCSVData (dataset: ActivityOverviewDataBySpecies[]): Promise<string> {
  const dataAsJson = getJsonForDataset(dataset)
  return await toCsv(dataAsJson)
}

function getJsonForDataset (dataset: ActivityOverviewDataBySpecies[]): CsvData[] {
  return dataset.map(({ scientificName, taxon, detectionCount, detectionFrequency, occupiedSites, occupancyNaive }) => ({
    'species name': scientificName,
    'taxonomy class': taxon,
    'number of detections': detectionCount,
    'detection frequency': detectionFrequency,
    'number of occupied sites': occupiedSites,
    'naive occupancy': occupancyNaive
  }))
}
