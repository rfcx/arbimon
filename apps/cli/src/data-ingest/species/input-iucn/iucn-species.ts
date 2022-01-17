import axios, { AxiosRequestConfig } from 'axios'

import { ExtinctionRiskCode } from '@rfcx-bio/common/iucn'

import { env } from '../../../_services/env'
import { getSpeciesRedirectLink } from './utils'

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
  category: ExtinctionRiskCode | undefined
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
  try {
    const endpoint: AxiosRequestConfig = {
      method: 'GET',
      url: `${env.IUCN_BASE_URL}/species/${scientificName}?token=${env.IUCN_TOKEN}`
    }

    const { data } = await axios.request<IucnSpeciesResponse>(endpoint)
    const result = data?.result?.[0]
    if (!result) {
      console.warn('iucn/getSpeciesCommonInformation: no data', scientificName)
      return undefined
    }

    return {
      ...result,
      sourceUrl: getSpeciesRedirectLink(scientificName),
      sourceCitation: 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)'
    }
  } catch (error) {
    console.error('iucn/getSpeciesCommonInformation: api error', error)
    return undefined
  }
}
