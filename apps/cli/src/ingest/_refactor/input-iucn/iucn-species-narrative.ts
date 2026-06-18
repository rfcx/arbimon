import { type AxiosRequestConfig, type AxiosResponse } from 'axios'

import { getIucnSpecies } from '@/ingest/_refactor/input-iucn/iucn-species'
import { requireEnv } from '~/env'
import { logError } from '../../../_services/axios'
import { iucnRequest } from './iucn-request'

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
  citation: string | null
  criteria: string | null
  documentation: Documentation
  habitats: any[]
  latest: boolean | null
  locations: any[]
  population_trend: any[]
  possibly_extinct: boolean
  possibly_extinct_in_the_wild: boolean | null
  red_list_category: any[]
  sis_taxon_id: number | null
  taxon: any
  url: string
  year_published: string | null
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

/**
 * Fetch the IUCN assessment narrative for a known assessment id.
 *
 * This is the preferred entry point for the sync: the caller already holds the
 * assessment id (from the species lookup it did anyway), so we make exactly ONE
 * request to `/assessment/{id}` and do NOT re-fetch `/species`. See the
 * `getIucnSpeciesNarrative` wrapper below for why that matters.
 */
export async function getIucnAssessmentNarrative (assessmentId: number, scientificName: string): Promise<IucnSpeciesNarrative | undefined> {
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    headers: { Authorization: `Bearer ${IUCN_API_KEY}` },
    url: `${IUCN_BASE_URL}/assessment/${assessmentId}`
  }

  return await iucnRequest<IucnSpeciesNarrativeResponse>(endpoint)
    .then(mapResult(scientificName))
    .catch(logError('getIucnSpeciesNarrative', scientificName, '(no data)'))
}

/**
 * Backwards-compatible by-name lookup (kept for any external callers).
 *
 * WARNING: this makes an extra `getIucnSpecies` call just to obtain the
 * assessment id. The sync hot path must NOT use this — it already has the
 * species (and thus the assessment id) in hand, so it calls
 * `getIucnAssessmentNarrative` directly to avoid doubling IUCN `/species`
 * traffic across ~48.5k species per run.
 */
export async function getIucnSpeciesNarrative (scientificName: string): Promise<IucnSpeciesNarrative | undefined> {
  const iucnSpecies = await getIucnSpecies(scientificName)
  const assessmentId = iucnSpecies?.assessments[0].assessment_id
  if (assessmentId == null) {
    console.info('getIucnSpeciesNarrative', scientificName, '(no data)')
    return undefined
  }
  return await getIucnAssessmentNarrative(assessmentId, scientificName)
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
