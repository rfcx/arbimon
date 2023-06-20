import { type AxiosInstance } from 'axios'

// Request types
export interface RecordingCountParams {
  slug?: string
}

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/recordings/count`

// Service
export const apiArbimonGetRecordingCount = async (apiClient: AxiosInstance, params: RecordingCountParams = {}): Promise<number | undefined> => {
  if (params?.slug !== undefined) {
    return await apiClient.get<number>(detectSpecificRoutePrefix(params?.slug)).then(res => res.data)
  } else return 0
}
