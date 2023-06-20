import { type AxiosInstance } from 'axios'

// Request types
export interface SiteCountParams {
  slug?: string
}

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/sites-count`

// Service
export const apiArbimonGetSiteCount = async (apiClient: AxiosInstance, params: SiteCountParams = {}): Promise<number | undefined> => {
  if (params?.slug !== undefined) {
    return await apiClient.get<number>(detectSpecificRoutePrefix(params?.slug)).then(res => res.data)
  } else return 0
}
