import { type AxiosInstance } from 'axios'

import { type OrganizationTypes } from '../../dao/types'

// Request types
export interface SearchOrganizationsQuerystring {
  q?: string
  limit?: string
  offset?: string
}

export interface RecommendedOrganizationsQueryParams {
  userIds: number[]
}

// Response types
export type SearchOrganizationsResponse = Array<OrganizationTypes['light']>

// Route
export const searchOrganizationsRoute = '/organizations/search'

export const recommendedOrganizationsRoute = '/organizations/recommended'

// Service
export const apiBioGetSearchOrganizationsResult = async (apiClient: AxiosInstance, q: string, limit?: string, offset?: string): Promise<SearchOrganizationsResponse> => {
  const response = await apiClient.get(searchOrganizationsRoute, { params: { q, limit, offset } })
  return response.data
}

export const apiBioGetRecommendedOrganizations = async (apiClient: AxiosInstance, params: RecommendedOrganizationsQueryParams): Promise<SearchOrganizationsResponse> => {
  const response = await apiClient.get(recommendedOrganizationsRoute, { params })
  return response.data
}
