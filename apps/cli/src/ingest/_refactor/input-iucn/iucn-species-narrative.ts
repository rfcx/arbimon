import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

import { requireEnv } from '~/env'
import { logError } from '../../../_services/axios'
import { getSpeciesRedirectLink } from './utils'

const { IUCN_BASE_URL, IUCN_TOKEN } = requireEnv('IUCN_BASE_URL', 'IUCN_TOKEN')

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
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    url: `${IUCN_BASE_URL}/species/narrative/${scientificName}?token=${IUCN_TOKEN}`
  }

  return await axios.request<IucnSpeciesNarrativeResponse>(endpoint)
    .then(mapResult(scientificName))
    .catch(logError('getIucnSpeciesNarrative', scientificName, '(no data)'))
}

const mapResult = (scientificName: string) => (response: AxiosResponse<IucnSpeciesNarrativeResponse>): IucnSpeciesNarrative | undefined => {
  const result = response.data?.result?.[0]
  if (!result) {
    console.info(response.status, 'getIucnSpeciesNarrative', scientificName, '(no data)')
    return undefined
  }

  console.info(response.status, 'getIucnSpeciesNarrative', scientificName)
  return {
    ...result,
    sourceUrl: getSpeciesRedirectLink(scientificName),
    sourceCitation: 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)'
  }
}
