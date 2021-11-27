import axios, { AxiosRequestConfig } from 'axios'

import { env } from '../../_services/env/index.js'
import { ApiNotFoundError } from '../../_services/errors/index.js'

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

export type RedListCategory = 'NE' | 'DD' | 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX'

interface IucnSpeciesResponse {
  name?: string
  result?: IucnSpeciesResult[]
}

interface IucnSpeciesResult {
  category: RedListCategory | undefined
  criteria: string | null
  marine_system: boolean | null
  freshwater_system: boolean | null
  terrestrial_system: boolean | null
  aoo_km2: boolean | null
  eoo_km2: boolean | null
  elevation_upper: number | null
  elevation_lower: number | null
  depth_upper: number | null
  depth_lower: number | null
  assessor: string | null
  reviewer: string | null
  errata_flag: boolean | null
  errata_reason: string | null
  amended_flag: boolean | null
  amended_reason: string | null
}

export async function getSpeciesInformation (speciesName: string): Promise<IucnSpeciesNarrativeResult | undefined> {
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    url: `${env.IUCN_BASE_URL}/species/narrative/${speciesName}?token=${env.IUCN_TOKEN}`
  }

  const { data } = await axios.request<IucnSpeciesNarrativeResponse>(endpoint)
  return data?.result?.[0]
}

export async function getSpeciesRank (speciesName: string): Promise<RedListCategory | undefined> {
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    url: `${env.IUCN_BASE_URL}/species/${speciesName}?token=${env.IUCN_TOKEN}`
  }

  const { data } = await axios.request<IucnSpeciesResponse>(endpoint)
  if (data?.result?.length === 0) { throw ApiNotFoundError() }
  return data?.result?.[0].category
}
