import axios from 'axios'
import * as dotenv from 'dotenv'
import { BioIucnSpeciesResponse } from 'iucn/types'

import { Endpoint } from '../_services/api-helper/types'

interface IucnSpeciesNarrativeResult {
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
  name: string
  result: IucnSpeciesNarrativeResult[]
}

dotenv.config()

const IUCN_TOKEN = process.env.IUCN_TOKEN ?? ''
const IUCN_BASE_URL = process.env.IUCN_BASE_URL ?? ''

export async function getSpeciesSummary (speciesName: string): Promise<BioIucnSpeciesResponse | undefined> {
  const information = await getSpeciesInformation(speciesName)
  if (!information) return undefined

  return {
    content: information?.habitat ?? information?.rationale ?? '',
    redirectUrl: `${IUCN_BASE_URL}/website/${speciesName}`
  }
}

async function getSpeciesInformation (speciesName: string): Promise<IucnSpeciesNarrativeResult | undefined> {
  const endpoint: Endpoint = ({
    method: 'GET',
    url: `${IUCN_BASE_URL}/species/narrative/${speciesName}?token=${IUCN_TOKEN}`
  })

  try {
    const { data } = await axios.request<IucnSpeciesNarrativeResponse>(endpoint)
    return data.result.length === 0 ? undefined : data.result[0]
  } catch (e) {
    console.error(e)
    return undefined
  }
}
