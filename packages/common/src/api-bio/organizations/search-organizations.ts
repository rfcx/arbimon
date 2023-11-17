import { type AxiosInstance } from 'axios'

import { type OrganizationTypes } from '@/dao/types'

// Request types
export interface SearchOrganizationsQuerystring {
  q?: string
  limit?: string
  offset?: string
}

// Response types
export type SearchOrganizationsResponse = Array<OrganizationTypes['light']>

// Route
export const searchOrganizationsRoute = '/organizations/search'

// Service
export const apiBioGetSearchOrganizationsResult = async (apiClient: AxiosInstance, q: string, limit?: string, offset?: string): Promise<SearchOrganizationsResponse> => {
  const response = await apiClient.get('/organizations/search', { params: { q, limit, offset } })
  return response.data
}
