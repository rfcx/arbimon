import axios, { AxiosRequestConfig } from 'axios'
import * as dotenv from 'dotenv'

import { ExtinctionRiskCode } from '@rfcx-bio/common/iucn'

dotenv.config()

// TODO: Validate env
const IUCN_BASE_URL = process.env.IUCN_BASE_URL ?? ''
const IUCN_TOKEN = process.env.IUCN_TOKEN ?? ''

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

interface IucnSpeciesResponse {
  name?: string
  result?: IucnSpeciesResult[]
}

interface IucnSpeciesResult {
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

export async function getSpeciesInformation (speciesName: string): Promise<IucnSpeciesNarrativeResult | undefined> {
  try {
    const endpoint: AxiosRequestConfig = {
      method: 'GET',
      url: `${IUCN_BASE_URL}/species/narrative/${speciesName}?token=${IUCN_TOKEN}`
    }

    const { data } = await axios.request<IucnSpeciesNarrativeResponse>(endpoint)
    if (data?.result?.length === 0) console.warn('iucn/getSpeciesInformation: no data', speciesName)
    return data?.result?.[0]
  } catch (error) {
    console.error('iucn/getSpeciesInformation: api error', error)
    return undefined
  }
}

export async function getSpeciesCommonInformation (speciesName: string): Promise<IucnSpeciesResult | undefined> {
  try {
    const endpoint: AxiosRequestConfig = {
      method: 'GET',
      url: `${IUCN_BASE_URL}/species/${speciesName}?token=${IUCN_TOKEN}`
    }

    const { data } = await axios.request<IucnSpeciesResponse>(endpoint)
    if (data?.result?.length === 0) console.warn('iucn/getSpeciesCommonInformation: no data', speciesName)
    return data?.result?.[0]
  } catch (error) {
    console.error('iucn/getSpeciesCommonInformation: api error', error)
    return undefined
  }
}

export function getSpeciesRedirectLink (speciesName: string): string {
  return `${IUCN_BASE_URL ?? ''}/website/${encodeURIComponent(speciesName)}`
}
