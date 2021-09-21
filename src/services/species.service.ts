import _ from 'lodash'

import rawDetections from '@/api/raw-species-richness-data-01-07-apr-2021.json'
import { SpeciesModels, StreamModels } from '@/models'

interface SpeciesRichnessRequestParams {
  start: string
  end: string
  streams: StreamModels.Stream[]
}

export function getMockupSpecies (options: SpeciesRichnessRequestParams): SpeciesModels.SpeciesRichnessBarChartItem[] {
  const { start, end, streams } = options
  const filteredDetections = rawDetections.filter(r => r.date >= start && r.date < end && (streams.length === 0 || _.includes(streams.map(s => s.id), r.stream_id)))
  const groupedDetections = _.groupBy(filteredDetections, 'taxon')
  const data = _.mapValues(groupedDetections, (value, key) => {
    return {
      label: key,
      population: new Set(value.map(d => d.species_id)).size
    }
  })

  return Object.values(data)
}
