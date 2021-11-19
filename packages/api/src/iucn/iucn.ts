import axios from 'axios'

import { Endpoint } from '../_services/api-helper/types'
import { env } from '../_services/env/index.js'

export interface IucnSpeciesNarrativeResult {
  species_id: number
  taxonomicnotes: string | null
  rationale: string | null
  geographicrange: string | null
  population: string | null
  populationtrend: string | null
  habitat: string | null
  threats: string | null
  conservationmeasures: string | null
  usetrade: string | null
}

interface IucnSpeciesNarrativeResponse {
  name?: string
  result?: IucnSpeciesNarrativeResult[]
}

export async function getSpeciesInformation (speciesName: string): Promise<IucnSpeciesNarrativeResult | undefined> {
  const endpoint: Endpoint = {
    method: 'GET',
    url: `${env.IUCN_BASE_URL}/species/narrative/${speciesName}?token=${env.IUCN_TOKEN}`
  }

  const { data } = await axios.request<IucnSpeciesNarrativeResponse>(endpoint)
  return data?.result?.[0]
}
