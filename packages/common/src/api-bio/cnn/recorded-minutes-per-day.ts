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

export type GetRecordedMinutesPerDayResponse = Array<{
  date: string
  recordedMinutesCount: number
}>

// Route
export const getRecordedMinutesPerDayRoute = '/projects/:projectId/recordings-per-day'

// Service
export const apiBioGetRecordedMinutesPerDayRoute = async (apiClient: AxiosInstance, projectId: number): Promise<GetRecordedMinutesPerDayResponse> => {
  const response = await apiClient.get(`/projects/${projectId}/recordings-per-day`)
  return response.data
}
