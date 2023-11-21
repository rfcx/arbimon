import { type AxiosInstance } from '@/../../utils/node_modules/axios'
import { type OrganizationType, type OrganizationTypes } from '../../dao/types'

// Request types
export type CreateOrganizationRequestBody = Pick<OrganizationTypes['light'], | 'name' | 'type' | 'url'>

// Response types
export type CreateOrganizationResponseBody = OrganizationTypes['light']

// Route
export const createOrganizationRoute = '/organizations'

// Service
export const apiBioCreateOrganization = async (apiClient: AxiosInstance, name: string, type: OrganizationType, url: string): Promise<CreateOrganizationResponseBody> => {
  const response = await apiClient.post(createOrganizationRoute, { name, type, url })
  return response.data
}
