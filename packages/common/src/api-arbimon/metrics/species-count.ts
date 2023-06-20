import { type AxiosInstance } from 'axios'

// Request types
export interface SpeciesCountParams {
  slug?: string
}

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/species-count`

// Service
export const apiArbimonGetSpeciesCount = async (apiClient: AxiosInstance, params: SpeciesCountParams = {}): Promise<number | undefined> => {
  if (params?.slug !== undefined) {
    return await apiClient.get<number>(detectSpecificRoutePrefix(params?.slug)).then(res => res.data)
  } else return 0
}
