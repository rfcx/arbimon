import { groupBy } from 'lodash-es'

import { type RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { type GroupedBarChartItem } from '~/charts/horizontal-bar-chart'
import { type ColoredFilter } from '~/filters'
import { type MapDataSet } from '~/maps/types'
import { useStoreOutsideSetup } from '~/store'
import { type DetectedSpeciesItem } from './components/species-richness-detected-species/types'

interface RichnessDataset extends ColoredFilter {
  data: RichnessDatasetResponse
}

export const MAP_KEY_RICHNESS_TOTAL = 'All'

export function getBarChartDataset (datasets: RichnessDataset[]): GroupedBarChartItem[] {
  const store = useStoreOutsideSetup()

  const taxonClasses = store.projectFilters?.taxonClasses

  return [...new Set(datasets.flatMap(ds => Object.keys(ds.data.richnessByTaxon).map(Number)))]
    .map(taxonClassId => {
      const taxonClassName = taxonClasses?.find(tc => tc.id === taxonClassId)?.commonName ?? 'Unknown'
      return {
        group: taxonClassName,
        series: datasets.map(ds => ({
            category: '', // TODO - Maybe add the dataset name here
            frequency: ds.data.richnessByTaxon[taxonClassId] ?? 0,
            color: ds.color
          }
        ))
      }
  })
}

export function getMapDataset (datasets: RichnessDataset[]): MapDataSet[] {
  const store = useStoreOutsideSetup()

  const locationSites = store.projectFilters?.locationSites
  const taxonClasses = store.projectFilters?.taxonClasses
  const intermediate = datasets.map(({ color, data: richnessData, sites, ...filter }) => {
    const groupedBySite = groupBy(richnessData.richnessBySite, 'locationSiteId')
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
        values: {
          ...toRichnessTaxonObject,
          [MAP_KEY_RICHNESS_TOTAL]: Object.values<number>(toRichnessTaxonObject).reduce((sum, val) => sum + val, 0)
        }
      }
    })
    return { color, data, sites: sites.flatMap(sg => sg.value), ...filter, maxValues: {} }
  })

  // TODO: Do this natively in the API instead of after the fact
  const classes = new Set(intermediate.flatMap(i => Object.keys(i.data.map(d => d.values))))
  const maxAll = Math.max(...intermediate.map(ds => Math.max(...ds.data.map(d => d.values[MAP_KEY_RICHNESS_TOTAL]))))
  const maxValues = Object.fromEntries([...classes, MAP_KEY_RICHNESS_TOTAL].map(name => [name, maxAll]))

  return intermediate.map(ds => ({
    ...ds,
    maxValues
  }))
}

export function getTableData (datasets: RichnessDataset[]): DetectedSpeciesItem[] {
  const store = useStoreOutsideSetup()
  const taxonClasses = store.projectFilters?.taxonClasses ?? []

  const richnessPresences = datasets.map(ds => ds.data.richnessPresence)
  const allUniqueSpecies = richnessPresences.flat().filter((value, index, self) => self.findIndex(({ taxonSpeciesId }) => taxonSpeciesId === value.taxonSpeciesId) === index)

  return allUniqueSpecies.map(({ taxonClassId, taxonSpeciesId, taxonSpeciesSlug, commonName, scientificName }) => {
    const taxonClassName = taxonClasses.find(({ id }) => id === taxonClassId)?.commonName ?? 'Unknown'
    const data = richnessPresences.map(pr => pr.find(sp => sp.taxonSpeciesId === taxonSpeciesId) !== undefined)
    return {
      taxonClassName,
      taxonSpeciesId,
      taxonSpeciesSlug,
      commonName,
      scientificName,
      data,
      total: data.filter(value => value).length
    }
  }).sort((a, b) => b.total - a.total || a.scientificName.localeCompare(b.scientificName))
}
