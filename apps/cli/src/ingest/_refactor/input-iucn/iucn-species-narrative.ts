import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

import { getIucnSpecies } from '@/ingest/_refactor/input-iucn/iucn-species'
import { requireEnv } from '~/env'
import { logError } from '../../../_services/axios'

const { IUCN_BASE_URL, IUCN_API_KEY } = requireEnv('IUCN_BASE_URL', 'IUCN_API_KEY')

export type IucnSpeciesNarrative = IucnSpeciesNarrativeResponse & {
  sourceUrl: string
  sourceCitation: string
}

interface IucnSpeciesNarrativeResponse {
  assessment_date: string | null
  assessment_id: number | null
  ssessment_points: boolean | null
  assessment_ranges: boolean | null
  biogeographical_realms: BiogeographicalRealms[]
  citation: string | null
  conservation_actions: ConservationActions[]
  credits: any[]
  criteria: string | null
  documentation: Documentation
  errata: any[]
  faos: any[]
  growth_forms: any[]
  habitats: any[]
  latest: boolean | null
  lmes: any[]
  locations: any[]
  population_trend: any[]
  possibly_extinct: boolean
  possibly_extinct_in_the_wild: boolean | null
  red_list_category: any[]
  references: any[]
  researches: any[]
  scopes: any[]
  sis_taxon_id: number | null
  stresses: any[]
  supplementary_info: any[]
  systems: any[]
  taxon: any
  threats: any[]
  url: string
  use_and_trade: any[]
  year_published: string | null
}

interface BiogeographicalRealms {
  code: string | null
  description: BiogeographicalRealmsDescription
}

interface BiogeographicalRealmsDescription {
  en: string | null
}

interface ConservationActions {
  code: string | null
  description: ConservationActionsDescription
  note: string | null
}

interface ConservationActionsDescription {
  en: string | null
}

interface Documentation {
  habitats: string | null
  measures: string | null
  population: string | null
  range: string | null
  rationale: string | null
  taxonomic_notes: string | null
  threats: string | null
  trend_justification: string | null
  use_trade: string | null
}

export async function getIucnSpeciesNarrative (scientificName: string): Promise<IucnSpeciesNarrative | undefined> {
  const iucnSpecies = await getIucnSpecies(scientificName)
  const assessmentId = iucnSpecies?.assessments[0].assessment_id
  if (assessmentId == null) {
    console.info('getIucnSpeciesNarrative', scientificName, '(no data)')
    return undefined
  }
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    headers: { Autorization: `${IUCN_API_KEY}` },
    url: `${IUCN_BASE_URL}/assessment/${assessmentId}`
  }

  return await axios.request<IucnSpeciesNarrativeResponse>(endpoint)
    .then(mapResult(scientificName))
    .catch(logError('getIucnSpeciesNarrative', scientificName, '(no data)'))
}

const mapResult = (scientificName: string) => (response: AxiosResponse<IucnSpeciesNarrativeResponse>): IucnSpeciesNarrative | undefined => {
  const result = response.data
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!response.data) {
    console.info(response.status, 'getIucnSpeciesNarrative', scientificName, '(no data)')
    return undefined
  }

  console.info(response.status, 'getIucnSpeciesNarrative', scientificName)
  return {
    ...result,
    sourceUrl: result.url,
    sourceCitation: 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)'
  }
}
