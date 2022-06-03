import { groupBy } from 'lodash-es'

import { RichnessDatasetResponse, RichnessPresence } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { useProjectData } from '~/api/project-service/use-project-data'
import { GroupedBarChartItem } from '~/charts/horizontal-bar-chart'
import { DetectionFilter } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { useStore } from '~/store'
import { DetectedSpeciesItem } from './components/species-richness-detected-species/types'

export type RichnessDataset = RichnessDatasetResponse & DetectionFilter

export const MAP_KEY_RICHNESS_TOTAL = 'All'

export function transformToBarChartDataset (datasets: RichnessDataset[]): GroupedBarChartItem[] {
  const store = useStore()
  const projectData = useProjectData()
  const taxonClasses = projectData.value.data?.taxonClasses
  if (taxonClasses === undefined) return []

  return [...new Set(datasets.flatMap(ds => Object.keys(ds.richnessByTaxon).map(Number)))]
    .map(taxonClassId => {
      const taxonClassName = taxonClasses?.find(tc => tc.id === taxonClassId)?.commonName ?? 'Unknown'
      return {
        group: taxonClassName,
        series: datasets.map((ds, idx) => ({
            category: '', // TODO - Maybe add the dataset name here
            frequency: ds.richnessByTaxon[taxonClassId] ?? 0,
            color: store.datasetColors[idx]
          }
        ))
      }
  })
}

export function transformToBySiteDataset (datasets: RichnessDataset[]): MapDataSet[] {
  const projectData = useProjectData()
  const taxonClasses = projectData.value.data?.taxonClasses
  const locationSites = projectData.value.data?.locationSites
  if (taxonClasses === undefined || locationSites === undefined) return []

  const intermediate = datasets.map(({ richnessBySite, dateStartLocal, dateEndLocal, siteGroups }) => {
    const groupedBySite = groupBy(richnessBySite, 'locationSiteId')
    const locationSiteIds = Object.keys(groupedBySite).map(Number)
    const data = locationSiteIds.map(locationSiteId => {
      const matchedSite = locationSites?.find(s => s.id === locationSiteId)
      const classWithRichness = groupedBySite[locationSiteId].map(s => {
        const taxonClassName = taxonClasses?.find(tc => tc.id === s.taxonClassId)?.commonName ?? 'Unknown'
        return { [taxonClassName]: s.richness }
      })
      const toRichnessTaxonObject = Object.assign({}, ...classWithRichness)
      return {
        siteName: matchedSite?.name ?? '',
        latitude: matchedSite?.latitude ?? 0,
        longitude: matchedSite?.longitude ?? 0,
        distinctSpecies: {
          ...toRichnessTaxonObject,
          [MAP_KEY_RICHNESS_TOTAL]: Object.values<number>(toRichnessTaxonObject).reduce((sum, val) => sum + val, 0)
        }
      }
    })

    const sites = siteGroups.flatMap(({ sites }) => sites)
    return { startDate: dateStartLocal, endDate: dateEndLocal, sites, data, maxValues: {} }
  })

  // TODO: Do this natively in the API instead of after the fact
  const classes = new Set(intermediate.flatMap(i => Object.keys(i.data.map(d => d.distinctSpecies))))
  const maxAll = Math.max(...intermediate.map(ds => Math.max(...ds.data.map(d => d.distinctSpecies[MAP_KEY_RICHNESS_TOTAL]))))
  const maxValues = Object.fromEntries([...classes, MAP_KEY_RICHNESS_TOTAL].map(name => [name, maxAll]))

  return intermediate.map(ds => ({
    ...ds,
    maxValues
  }))
}

export function getTableData (datasets: RichnessDataset[]): DetectedSpeciesItem[] {
  const projectData = useProjectData()
  const taxonClasses = projectData.value.data?.taxonClasses
  if (taxonClasses === undefined) return []

  const richnessPresences = datasets.map(ds => ds.richnessPresence)
  const allSpecies: { [speciesId: number]: RichnessPresence } = Object.assign({}, ...richnessPresences)

  return Object.entries(allSpecies)
    .map(([key, value]) => {
      const { taxonClassId, taxonSpeciesId, taxonSpeciesSlug, commonName, scientificName } = value
      const matchedClass = taxonClasses?.find(({ id }) => id === taxonClassId)
      return {
        taxonClassName: matchedClass?.commonName ?? 'Unknown',
        taxonSpeciesId,
        taxonSpeciesSlug,
        commonName,
        scientificName,
        data: richnessPresences.map(sp => key in sp),
        total: richnessPresences.filter(sp => key in sp).length
      }
    })
    .sort((a, b) => b.total - a.total || a.scientificName.localeCompare(b.scientificName))
}
