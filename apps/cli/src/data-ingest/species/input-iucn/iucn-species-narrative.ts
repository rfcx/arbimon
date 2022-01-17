import axios, { AxiosRequestConfig } from 'axios'

import { env } from '../../../_services/env'
import { getSpeciesRedirectLink } from './utils'

export type IucnSpeciesNarrative = IucnSpeciesNarrativeResponseResult & {
  sourceUrl: string
  sourceCitation: string
}

interface IucnSpeciesNarrativeResponse {
  name?: string
  result?: IucnSpeciesNarrativeResponseResult[]
}

interface IucnSpeciesNarrativeResponseResult {
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

export async function getIucnSpeciesNarrative (scientificName: string): Promise<IucnSpeciesNarrative | undefined> {
  try {
    const endpoint: AxiosRequestConfig = {
      method: 'GET',
      url: `${env.IUCN_BASE_URL}/species/narrative/${scientificName}?token=${env.IUCN_TOKEN}`
    }

    const { data } = await axios.request<IucnSpeciesNarrativeResponse>(endpoint)
    const result = data?.result?.[0]
    if (!result) {
      console.warn('iucn/getSpeciesInformation: no data', scientificName)
      return undefined
    }

    return {
      ...result,
      sourceUrl: getSpeciesRedirectLink(scientificName),
      sourceCitation: 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)'
    }
  } catch (error) {
    console.error('iucn/getSpeciesInformation: api error', error)
    return undefined
  }
}
