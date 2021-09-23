import { groupBy, mapValues } from 'lodash'

import rawDetections from '@/api/raw-species-richness-data-01-07-apr-2021.json'
import { ChartModels, StreamModels } from '@/models'

interface SpeciesRichnessRequestParams {
  start: string
  end: string
  streams: StreamModels.Stream[]
}

export function getMockupSpecies (options: SpeciesRichnessRequestParams): ChartModels.BarChartItem[] {
  const { start, end, streams } = options
  const filteredDetections = rawDetections.filter(r => r.date >= start && r.date < end && (streams.length === 0 || streams.map(s => s.id).includes(r.stream_id)))
  const groupedDetections = groupBy(filteredDetections, 'taxon')
  const data = mapValues(groupedDetections, (value, key) => {
    return {
      category: key,
      frequency: new Set(value.map(d => d.species_id)).size
    }
  })

  return Object.values(data)
}
