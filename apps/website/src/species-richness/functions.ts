import { RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { SpeciesLight } from '@rfcx-bio/common/api-bio/species/types'

import { GroupedBarChartItem } from '~/charts/horizontal-bar-chart'
import { ColoredFilter } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { useStoreOutsideSetup } from '~/store'
import { DetectedSpeciesItem } from './components/species-richness-detected-species/types'

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
  // TODO: Delete this
  const intermediate = datasets.map(({ color, data: srData, sites, ...filter }) => {
    const data = srData.richnessBySite.map(s => ({
      ...s,
      distinctSpecies: {
        ...s.distinctSpecies,
        [MAP_KEY_RICHNESS_TOTAL]: Object.values(s.distinctSpecies).reduce((sum, val) => (sum as number) + (val as number), 0)
      }
    }))
    return { color, data, sites: sites.flatMap(sg => sg.value), ...filter, maxValues: {} }
  })

  // TODO: Do this natively in the API instead of after the fact
  const taxonClasses = new Set(intermediate.flatMap(i => Object.keys(i.data.map(d => d.distinctSpecies))))
  const maxAll = Math.max(...intermediate.map(ds => Math.max(...ds.data.map(d => d.distinctSpecies[MAP_KEY_RICHNESS_TOTAL] as number))))
  const maxValues = Object.fromEntries([...taxonClasses, MAP_KEY_RICHNESS_TOTAL].map(name => [name, maxAll]))

  return intermediate.map(ds => ({
    ...ds,
    maxValues
  }))
}

export function getTableData (datasets: RichnessDataset[]): DetectedSpeciesItem[] {
  const speciesPresences = datasets.map(ds => ds.data.speciesPresence)
  const allSpecies: { [speciesId: string]: SpeciesLight } = Object.assign({}, ...speciesPresences)

  return Object.entries(allSpecies)
    .map(([key, value]) => ({
      ...value,
      data: speciesPresences.map(sp => key in sp),
      total: speciesPresences.filter(sp => key in sp).length
    }))
    .sort((a, b) => b.total - a.total || a.scientificName.localeCompare(b.scientificName))
}
