import { type AxiosInstance } from 'axios'

// Request types
export interface getRecordedMinutesPerDayParams {
  projectId: string
}

/**
 * Recorded minutes from the API where the key is date in format `YYYY-MM-DD`, and the value being the number of minutes in the given day. Which day that are not present in the response means that day does not have any recording minutes.
 */
export type GetRecordedMinutesPerDayResponse = Record<string, number>

// Route
export const getRecordedMinutesPerDayRoute = '/projects/:projectId/recordings-per-day'

// Service
export const apiBioGetRecordedMinutesPerDayRoute = async (apiClient: AxiosInstance, projectId: number): Promise<GetRecordedMinutesPerDayResponse> => {
  const response = await apiClient.get(`/projects/${projectId}/recordings-per-day`)
  return response.data
}
