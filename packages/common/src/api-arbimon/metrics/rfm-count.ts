import { type AxiosInstance } from 'axios'

// Request types
export interface RfmCountParams {
  slug?: string
}

export const detectSpecificRoutePrefixJobs = (slug: string): string => `/api/project/${slug}/rfm-classif-job-count`
export const detectSpecificRoutePrefixSpecies = (slug: string): string => `/api/project/${slug}/rfm-species-detected`

// Service
export const apiArbimonGetRfmJobCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== '') {
    return await apiClient.get<number>(detectSpecificRoutePrefixJobs(slug)).then(res => res.data)
  } else return 0
}

export const apiArbimonGetRfmSpeciesDetected = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== '') {
    return await apiClient.get<number>(detectSpecificRoutePrefixSpecies(slug)).then(res => res.data)
  } else return 0
}
