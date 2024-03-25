import { type AxiosInstance } from 'axios'

import { type CoreReviewStatus, type ValidationStatus } from './classifier-job-information'

// Request type
export interface GetClassifierJobSpeciesQueryParams {
  q?: string
  order?: 'asc' | 'desc'
  sort?: 'name' | CoreReviewStatus
  limit?: string
  offset?: string
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

export const validSortParams = ['name', 'unvalidated', 'notPresent', 'present', 'unknown']

export const xTotalSpeciesCountHeaderName = 'x-total-species-count'
export type GetClassifierJobSpeciesResponse = ClassifierJobSpecies[]

// Route
export const getClassifierJobSpeciesRoute = '/jobs/:jobId/species'

// Service
export const apiBioGetClassifierJobSpecies = async (apiClient: AxiosInstance, jobId: number, params: GetClassifierJobSpeciesQueryParams): Promise<{ total: number, data: GetClassifierJobSpeciesResponse }> => {
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
