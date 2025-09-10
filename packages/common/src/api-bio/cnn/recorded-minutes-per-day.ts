import { type AxiosInstance } from 'axios'

// Request types
export interface GetRecordedMinutesPerDayParams {
  projectId: string
}

export interface GetRecordedMinutesPerDayQueryParams {
  sites?: string
  start?: string
  end?: string
}

export interface GetRecordedMinutesPerDay {
  date: string
  recordedMinutesCount: number
}

export type GetRecordedMinutesPerDayResponse = GetRecordedMinutesPerDay[]

// Route
export const getRecordedMinutesPerDayRoute = '/projects/:projectId/recordings-per-day'

// Service
export const apiBioGetRecordedMinutesPerDayRoute = async (apiClient: AxiosInstance, projectId: string): Promise<GetRecordedMinutesPerDayResponse> => {
  const response = await apiClient.get(`/projects/${projectId}/recordings-per-day`)
  return response.data
}
