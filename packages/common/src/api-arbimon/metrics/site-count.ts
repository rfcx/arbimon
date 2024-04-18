import { type AxiosInstance } from 'axios'

// Request types
export interface SiteCountParams {
  slug?: string
}

// Service
export const apiArbimonGetSiteCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== undefined) {
    return await apiClient.get<number>(`/legacy-api/project/${slug}/site-count`).then(res => res.data)
  } else return 0
}
