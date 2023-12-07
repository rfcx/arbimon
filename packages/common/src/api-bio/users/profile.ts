import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type OrganizationTypes, type UserProfile } from '../../dao/types'

// Request types
export type UpdateUserProfileRequestBody = Partial<Omit<UserProfile, 'id' | 'userIdAuth0' | 'image' | 'createdAt' | 'updatedAt'>>

// Response types
export type UserProfileResponse = Omit<UserProfile, 'id' | 'userIdAuth0'>

export type OrganizationsResponse = Array<OrganizationTypes['light']>

// Route
export const userProfileRoute = '/profile'
export const organizationsListRoute = '/organizations'

// Service
export const apiGetUserProfile = async (apiClient: AxiosInstance): Promise<UserProfileResponse | undefined> =>
  await apiGetOrUndefined(apiClient, userProfileRoute)

export const apiUpdateUserProfile = async (apiClient: AxiosInstance, data: UpdateUserProfileRequestBody): Promise<void> => {
  await apiClient.patch(userProfileRoute, data)
}

export const apiGetOrganizationsList = async (apiClient: AxiosInstance): Promise<OrganizationsResponse> => {
  const response = await apiClient.get(organizationsListRoute)
  return response.data
}
