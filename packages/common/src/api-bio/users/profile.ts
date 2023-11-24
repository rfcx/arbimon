import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type UserProfile } from '../../dao/types'

// Response types
export type UserProfileResponse = Omit<UserProfile, 'id' | 'userIdAuth0'>

// Route
export const userProfileRoute = '/profile'

// Service
export const apiGetUserProfile = async (apiClient: AxiosInstance): Promise<UserProfileResponse | undefined> =>
  await apiGetOrUndefined(apiClient, userProfileRoute)
