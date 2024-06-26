import { type AxiosInstance } from 'axios'

import { type ValidationStatus, ARBIMON_CORE_REVIEW_STATUS_MAP } from './classifier-job-information'

// Request type
export interface GetClassifierJobSpeciesQueryParams {
  q?: string
  /**
   * Comma separated string of columns to sort like `name,unvalidated`.
   * Append negative sign in the front of the text to denote descending
   * sort by that column. For example
   *
   * `name,-unvalidated`
   *
   * means sort first by `name` ascendingly, then sort second by `unvalidated` descendingly.
   *
   * Possible column names for sorting:
   *
   * ```
   * - name
   * - unvalidated
   * - notPresent
   * - present
   * - unknown
   * ```
   */
  sort?: string
  limit?: number
  offset?: number
}

export interface GetClassifierJobSpeciesParams {
  jobId: string
}

// Response type
export type ClassifierJobSpecies = ValidationStatus & {
  title: string
  value: string
  image: string | null
}

export const validSortColumns: string[] = Object.keys(ARBIMON_CORE_REVIEW_STATUS_MAP as Record<string, string>).concat('name')

export const xTotalSpeciesCountHeaderName = 'x-total-species-count'
export type GetClassifierJobSpeciesResponse = ClassifierJobSpecies[]

// Route
export const getClassifierJobSpeciesRoute = '/jobs/:jobId/species'

// Service
export const apiBioGetClassifierJobSpecies = async (
  apiClient: AxiosInstance,
  jobId: number,
  params: GetClassifierJobSpeciesQueryParams
): Promise<{ total: number, data: GetClassifierJobSpeciesResponse }> => {
  const response = await apiClient.get(`/jobs/${jobId}/species`, { params })

  let totalCount = 0
  const rawHeader = response.headers?.[xTotalSpeciesCountHeaderName]
  if (rawHeader !== undefined && rawHeader !== '' && !Number.isNaN(Number(rawHeader))) {
    totalCount = Number(rawHeader)
  }

  return {
    total: totalCount,
    data: response.data
  }
}
