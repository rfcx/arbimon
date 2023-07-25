import { type AxiosInstance } from 'axios'

// Request types
export interface PmCountParams {
  slug?: string
}

export const detectSpecificRoutePrefixSpecies = (slug: string): string => `/api/project/${slug}/pm-species-detected`
export const detectSpecificRoutePrefixTemplate = (slug: string): string => `/api/project/${slug}/pm-template-count`

// Service
export const apiArbimonGetPmSpeciesCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== '') {
    return await apiClient.get<number>(detectSpecificRoutePrefixSpecies(slug)).then(res => res.data)
  } else return 0
}

export const apiArbimonGetTemplateCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== '') {
    return await apiClient.get<number>(detectSpecificRoutePrefixTemplate(slug)).then(res => res.data)
  } else return 0
}
