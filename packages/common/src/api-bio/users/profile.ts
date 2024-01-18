import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type OrganizationTypes, type UserProfile, type UserTypes } from '../../dao/types'

// Request types
export interface UsersRequestQueryParams {
  q?: string
}
export type UpdateUserProfileRequestBody = Partial<Omit<UserProfile, 'id' | 'idAuth0' | 'image' | 'createdAt' | 'updatedAt'>>

// Response types
export type UsersLightResponse = Array<UserTypes['light']>
export type UserProfileResponse = Omit<UserProfile, 'id' | 'idAuth0'>
export type OrganizationsResponse = Array<OrganizationTypes['light']>

// Route
export const usersRoute = '/users'
export const userProfileRoute = '/profile'
export const organizationsListRoute = '/organizations'

// Service
export const apiGetUsers = async (apiClient: AxiosInstance, params: UsersRequestQueryParams): Promise<UsersLightResponse> =>
  await apiClient.get<UsersLightResponse>(usersRoute, { params }).then(res => res.data)

export const apiGetUserProfile = async (apiClient: AxiosInstance): Promise<UserProfileResponse | undefined> =>
  await apiGetOrUndefined(apiClient, userProfileRoute)

export const apiUpdateUserProfile = async (apiClient: AxiosInstance, data: UpdateUserProfileRequestBody): Promise<void> => {
  await apiClient.patch(userProfileRoute, data)
}

export const apiGetOrganizationsList = async (apiClient: AxiosInstance): Promise<OrganizationsResponse> => {
  const response = await apiClient.get(organizationsListRoute)
  return response.data
}
