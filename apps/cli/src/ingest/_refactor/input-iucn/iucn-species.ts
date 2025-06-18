import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

import { requireEnv } from '~/env'
import { logError } from '../../../_services/axios'
import { getSpeciesApiRedirectLink } from './utils'

// TODO: This should be injected by the script controller
const { IUCN_API_KEY } = requireEnv('IUCN_API_KEY')

export type IucnSpecies = IucnSpeciesResponseResult & {
  sourceUrl: string
  sourceCitation: string
  assessments: Assessments[]
}

interface IucnSpeciesResponse {
  assessments?: Assessments[]
  params?: IucnSpeciesParams
  taxon?: IucnSpeciesResponseResult
}

interface IucnSpeciesParams {
  genus_name: string | null
  species_name: string | null
}

interface Assessments {
  assessment_id: number | null
  latest: boolean | null
  possibly_extinct: boolean | null
  possibly_extinct_in_the_wild: boolean | null
  red_list_category_code: string | null
  sis_taxon_id: string | null
  taxon_scientific_name: string | null
  url: string
  year_published: string | null
}

interface CommonName {
  main: boolean | null
  name: string | null
  language: string | null
}

interface IucnSpeciesResponseResult {
  sis_id: number | null
  scientific_name: string | null
  class_name: string | null
  order_name: string | null
  family_name: string | null
  genus_name: string | null
  species_name: string | null
  subpopulation_name: string | null
  infra_name: string | null
  authority: string | null
  species: boolean | null
  common_names: CommonName[]
  synonyms: any[]
}

export async function getIucnSpecies (scientificName: string): Promise<IucnSpecies | undefined> {
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    headers: { Autorization: `${IUCN_API_KEY}` },
    url: getSpeciesApiRedirectLink(scientificName)
  }

  return await axios.request<IucnSpeciesResponse>(endpoint)
    .then(mapResult(scientificName))
    .catch(logError('getIucnSpecies', scientificName, '(no data)'))
}

const mapResult = (scientificName: string) => (response: AxiosResponse<IucnSpeciesResponse>): IucnSpecies | undefined => {
  const taxonResult = response.data?.taxon
  const assessmentsResult = response.data?.assessments
  if (!taxonResult || !assessmentsResult) {
    console.info(response.status, 'getIucnSpecies', scientificName, '(no data)')
    return undefined
  }

  console.info(response.status, 'getIucnSpecies', scientificName)
  return {
    ...taxonResult,
    assessments: assessmentsResult,
    sourceUrl: assessmentsResult[0].url,
    sourceCitation: 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)'
  }
}
