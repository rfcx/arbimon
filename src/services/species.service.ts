import _ from 'lodash'

import rawSpecies from '@/api/raw-species-richness-data-01-07-apr-2021.json'
import { SpeciesModels, StreamModels } from '@/models'

interface SpeciesRichnessRequestParams {
  start: string
  end: string
  streams: StreamModels.Stream[]
}

export function getMockupSpecies (options: SpeciesRichnessRequestParams): SpeciesModels.SpeciesRichnessBarChartItem[] {
  const { start, end, streams } = options
  const filteredSpecies = rawSpecies.filter(r => r.date > start && r.date < end && _.includes(streams.map(s => s.id), r.stream_id))
  const groupedSpecies = _.groupBy(filteredSpecies, 'species_id')
  const data = _.mapValues(groupedSpecies, (value, key) => {
    return {
      label: value[0].scientific_name,
      population: value.map(v => v.num_of_recordings).reduce((prev, next) => Number(prev) + Number(next), 0)
    }
  })

  return _.flatMapDeep(data)
}
