import { type AxiosInstance } from 'axios'

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/sites-count`

// Service
export const apiArbimonGetSiteCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== '') {
    return await apiClient.get<number>(detectSpecificRoutePrefix(slug)).then(res => res.data)
  } else return 0
}
