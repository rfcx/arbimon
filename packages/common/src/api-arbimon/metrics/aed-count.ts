import { type AxiosInstance } from 'axios'

// Request types
export interface AedCountParams {
  slug?: string
}

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/aed-job-count`

// Service
export const apiArbimonGetAedCount = async (apiClient: AxiosInstance, params: AedCountParams = {}): Promise<number | undefined> => {
  if (params?.slug !== undefined) {
    return await apiClient.get<number>(detectSpecificRoutePrefix(params?.slug)).then(res => res.data)
  } else return 0
}
