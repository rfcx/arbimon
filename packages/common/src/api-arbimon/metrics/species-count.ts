import { type AxiosInstance } from 'axios'

// Request types
export interface SpeciesCountParams {
  slug?: string
}

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/species-count`

// Service
export const apiArbimonGetSpeciesCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== '') {
    return await apiClient.get<number>(detectSpecificRoutePrefix(slug)).then(res => res.data)
  } else return 0
}
