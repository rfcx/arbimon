import { ActivityOverviewData } from '~/api/activity-overview-service'
import { TAXONOMY_CLASSES, TAXONOMY_UNKNOWN_CLASS } from '~/api/taxonomy-service'
import { ColoredFilter } from '~/dataset-filters'
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
