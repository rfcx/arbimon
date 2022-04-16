import { axiosGetLogMap } from '~/axios'

export interface IucnApiOptions {
  IUCN_BASE_URL: string
  IUCN_TOKEN: string
}

export interface IucnSpeciesResponse {
  name?: string
  result?: IucnSpeciesResponseResult[]
}

export interface IucnSpeciesResponseResult {
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

export interface IucnSpeciesNarrativeResponse {
  name?: string
  result?: IucnSpeciesNarrativeResponseResult[]
}

export interface IucnSpeciesNarrativeResponseResult {
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

export class IucnService {
  constructor (private readonly options: IucnApiOptions) {}

  async getSpecies <U> (scientificName: string, mapFn: (data: IucnSpeciesResponse) => U | undefined | null): Promise<U | undefined> {
    const url = `${this.options.IUCN_BASE_URL}/species/${scientificName}?token=${this.options.IUCN_TOKEN}`
    const logContext = ['getSpecies', scientificName]

    return await axiosGetLogMap<IucnSpeciesResponse, U>(url, mapFn, logContext)
  }

  async getSpeciesNarrative <U> (scientificName: string, mapFn: (data: IucnSpeciesNarrativeResponse) => U | undefined | null): Promise<U | undefined> {
    const url = `${this.options.IUCN_BASE_URL}/species/narrative/${scientificName}?token=${this.options.IUCN_TOKEN}`
    const logContext = ['getSpeciesNarrative', scientificName]

    return await axiosGetLogMap<IucnSpeciesNarrativeResponse, U>(url, mapFn, logContext)
  }
}
