import { RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { SpeciesLight } from '@rfcx-bio/common/api-bio/species/types'
import { TAXONOMY_CLASS_ALL, TAXONOMY_CLASSES } from '@rfcx-bio/common/mock-data/raw-taxon-classes'

import { GroupedBarChartItem } from '~/charts/horizontal-bar-chart'
import { ColoredFilter } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import { DetectedSpeciesItem } from './components/species-richness-detected-species/types'

interface RichnessDataset extends ColoredFilter {
  data: RichnessDatasetResponse
}

export function getBarChartDataset (datasets: RichnessDataset[]): GroupedBarChartItem[] {
  return [...new Set(datasets.flatMap(ds => Object.keys(ds.data.richnessByTaxon)))]
    .map(group => ({
      group,
      series: datasets.map(ds => ({
        category: '', // TODO - Maybe add the dataset name here
        frequency: ds.data.richnessByTaxon[group] ?? 0,
        color: ds.color
      }))
    }))
    .sort((a, b) => a.group.localeCompare(b.group))
}

export function getMapDataset (datasets: RichnessDataset[]): MapDataSet[] {
  const intermediate = datasets.map(({ color, data: srData, sites, ...filter }) => {
    const data = srData.richnessBySite.map(s => ({
      ...s,
      distinctSpecies: {
        ...s.byTaxon,
        [TAXONOMY_CLASS_ALL.name]: Object.values(s.byTaxon).reduce((sum, val) => (sum as number) + (val as number), 0)
      }
    }))
    return { color, data, sites: sites.flatMap(sg => sg.value), ...filter, maxValues: {} }
  })
  // TODO 209 - Do this natively in the API instead of after the fact
  const maxAll = Math.max(...intermediate.map(ds => Math.max(...ds.data.map(d => d.byTaxon[TAXONOMY_CLASS_ALL.name] as number))))
  return intermediate.map(ds => ({
    ...ds,
    maxValues: Object.fromEntries([...TAXONOMY_CLASSES, TAXONOMY_CLASS_ALL].map(c => [c.name, maxAll]))
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
