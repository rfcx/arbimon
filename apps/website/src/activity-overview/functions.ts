import { downloadSpreadsheet } from '@rfcx-bio/utils/file'

import { ActivityOverviewData, ActivityOverviewDataBySpecies } from '~/api/activity-overview-service'
import { TAXONOMY_CLASSES, TAXONOMY_UNKNOWN_CLASS } from '~/api/taxonomy-service'
import { ColoredFilter, getExportDateTime, getExportFilterName } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'

export type ActivityOverviewDataBySite = ActivityOverviewData & ColoredFilter

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

export function transformToBySiteDataset (dataset: ActivityOverviewDataBySite): MapDataSet[] {
  const { startDate, endDate, sites, color, overviewBySite } = dataset

  const overviewBySiteSortedByKey = Object.fromEntries(Object.entries(overviewBySite).sort((a, b) => a[0].localeCompare(b[0])))

  const maximumNumbers = Object.values(overviewBySiteSortedByKey)
    .map(detectionsBySite => Object.values(detectionsBySite))
    .map(detections => {
      const detectionCounts = detections.map(({ detection }) => detection)
      const detectionFrequencies = detections.map(({ detectionFrequency }) => detectionFrequency)
      return [Math.max(0, ...detectionCounts), Math.max(0, ...detectionFrequencies)]
    })

  const mapDatasets: MapDataSet[] = []

  for (const [taxonKey, value] of Object.entries(overviewBySiteSortedByKey)) {
    const taxon = TAXONOMY_CLASSES.find(taxon => taxon.name === taxonKey)

    const data = Object.values(value).map(({ siteName, latitude, longitude, detection, detectionFrequency, occupancy }) => ({
      siteName,
      latitude,
      longitude,
      distinctSpecies: {
        [ACTIVITY_OVERVIEW_MAP_KEYS.detection]: detection,
        [ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency]: detectionFrequency,
        [ACTIVITY_OVERVIEW_MAP_KEYS.occupancy]: occupancy
      }
    }))

    const maxValues = {
      [ACTIVITY_OVERVIEW_MAP_KEYS.detection]: getPrettyMax(Math.max(0, ...maximumNumbers.map(m => m[0]))),
      [ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency]: getPrettyMax(Math.max(0, ...maximumNumbers.map(m => m[1])))
    }

    mapDatasets.push({
      startDate,
      endDate,
      sites,
      color,
      data,
      maxValues,
      title: taxon ? taxon.symbol : TAXONOMY_UNKNOWN_CLASS.symbol
    })
  }

  return mapDatasets
}

// TODO: Update when multiple datasets
export async function exportCSV (filter: ColoredFilter, dataset: ActivityOverviewDataBySpecies[], prefix: string): Promise<void> {
  const sortedDataset = dataset.sort((a, b) => a.scientificName.localeCompare(b.scientificName) ||
    a.taxon.localeCompare(b.taxon) ||
    a.detectionCount - b.detectionCount ||
    a.occupiedSites - b.occupiedSites)

  const { startDate, endDate, sites } = filter
  const exportTime = getExportDateTime()
  const filename = getExportFilterName(startDate, endDate, prefix, exportTime, sites) + '.csv'
  const dataAsJson = getJsonForDataset(sortedDataset)
  await downloadSpreadsheet(dataAsJson, filename)
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
