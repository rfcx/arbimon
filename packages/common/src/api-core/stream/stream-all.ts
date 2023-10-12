import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

// Request types
export interface StreamAllParams {
  name?: string
  projects?: string[]
  limit?: number
  offset?: number
  fields?: string[]
}

// Response type
export interface User {
  firstname: string
  lastname: string
  email: string
}

export interface Project {
  id: string
  name: string
  is_public: boolean
}

export interface Stream {
  id: string
  name: string
  start: string
  end: string
  is_public: boolean
  description: string
  created_at: string
  created_by: User
  updated_at: string
  max_sample_rate: number
  country_code: string
  latitude: number
  longitude: number
  altitude: number
  timezone: string
  timezone_locked: boolean
  external_id: string
  created_by_id: number
  country_name: string
  project: Project
}
export type StreamAllResponse = Stream[]

// Service
export const apiCoreGetStreamAll = async (apiClient: AxiosInstance, params: StreamAllParams = {}): Promise<StreamAllResponse | undefined> =>
  await apiGetOrUndefined(apiClient, '/streams', { params })
