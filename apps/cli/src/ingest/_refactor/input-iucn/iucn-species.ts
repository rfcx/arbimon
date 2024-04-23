import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

import { requireEnv } from '~/env'
import { logError } from '../../../_services/axios'
import { getSpeciesRedirectLink } from './utils'

// TODO: This should be injected by the script controller
const { IUCN_BASE_URL, IUCN_TOKEN } = requireEnv('IUCN_BASE_URL', 'IUCN_TOKEN')

export type IucnSpecies = IucnSpeciesResponseResult & {
  sourceUrl: string
  sourceCitation: string
}

interface IucnSpeciesResponse {
  name?: string
  result?: IucnSpeciesResponseResult[]
}

interface IucnSpeciesResponseResult {
  taxonid: number | null
  scientific_name: string | null
  kingdom: string | null
  phylum: string | null
  class: string | null
  order: string | null
  family: string | null
  genus: string | null
  main_common_name: string | null
  authority: string | null
  published_year: null | null
  assessment_date: string | null
  category: string | undefined
  criteria: string | null
  population_trend: string | null
  marine_system: boolean | null
  freshwater_system: boolean | null
  terrestrial_system: boolean | null
  assessor: string | null
  reviewer: string | null
  aoo_km2: boolean | null
  eoo_km2: boolean | null
  elevation_upper: number | null
  elevation_lower: number | null
  depth_upper: number | null
  depth_lower: number | null
  errata_flag: boolean | null
  errata_reason: string | null
  amended_flag: boolean | null
  amended_reason: string | null
}

export async function getIucnSpecies (scientificName: string): Promise<IucnSpecies | undefined> {
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    url: `${IUCN_BASE_URL}/species/${scientificName}?token=${IUCN_TOKEN}`
  }

  return await axios.request<IucnSpeciesResponse>(endpoint)
    .then(mapResult(scientificName))
    .catch(logError('getIucnSpecies', scientificName, '(no data)'))
}

const mapResult = (scientificName: string) => (response: AxiosResponse<IucnSpeciesResponse>): IucnSpecies | undefined => {
  const result = response.data?.result?.[0]
  if (!result) {
    console.info(response.status, 'getIucnSpecies', scientificName, '(no data)')
    return undefined
  }

  console.info(response.status, 'getIucnSpecies', scientificName)
  return {
    ...result,
    sourceUrl: getSpeciesRedirectLink(scientificName),
    sourceCitation: 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)'
  }
}
