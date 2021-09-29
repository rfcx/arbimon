import { groupBy, mapValues } from 'lodash'

import rawDetections from '@/api/raw-species-richness-data-01-07-apr-2021.json'
import { ChartModels, SiteModels } from '@/models'

interface SpeciesRichnessRequestParams {
  start: string
  end: string
  sites: SiteModels.Site[]
}

export function getMockupSpecies (options: SpeciesRichnessRequestParams): Array<Omit<ChartModels.BarChartItem, 'color'>> {
  const { start, end, sites } = options
  const filteredDetections = rawDetections.filter(r => r.date >= start && r.date < end && (sites.length === 0 || sites.map(s => s.id).includes(r.stream_id)))
  const groupedDetections = groupBy(filteredDetections, 'taxon')
  const data = mapValues(groupedDetections, (value, key) => {
    return {
      category: key,
      frequency: new Set(value.map(d => d.species_id)).size
    }
  })

  return Object.values(data)
}
