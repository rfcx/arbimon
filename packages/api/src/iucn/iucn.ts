import axios from 'axios'
import * as dotenv from 'dotenv'

import { Endpoint } from '../_services/api-helper/types'

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

dotenv.config()

const IUCN_TOKEN = process.env.IUCN_TOKEN ?? ''
const IUCN_BASE_URL = process.env.IUCN_BASE_URL ?? ''

export async function getSpeciesInformation (speciesName: string): Promise<IucnSpeciesNarrativeResult | undefined> {
  const endpoint: Endpoint = {
    method: 'GET',
    url: `${IUCN_BASE_URL}/species/narrative/${speciesName}?token=${IUCN_TOKEN}`
  }

  const { data } = await axios.request<IucnSpeciesNarrativeResponse>(endpoint)
  return data?.result?.[0]
}
