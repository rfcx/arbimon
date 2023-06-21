import { type AxiosInstance } from 'axios'

// Request types
export interface RfmCountParams {
  slug?: string
}

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/rfm-classif-job-count`

// Service
export const apiArbimonGetRfmCount = async (apiClient: AxiosInstance, params: RfmCountParams = {}): Promise<number | undefined> => {
  if (params?.slug !== undefined) {
    return await apiClient.get<number>(detectSpecificRoutePrefix(params?.slug)).then(res => res.data)
  } else return 0
}
