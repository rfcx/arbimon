import { type AxiosInstance } from 'axios'

// Request types
export interface AedCountParams {
  slug?: string
}

export const detectSpecificRoutePrefixAED = (slug: string): string => `/api/project/${slug}/aed-job-count`
export const detectSpecificRoutePrefixClustering = (slug: string): string => `/api/project/${slug}/clustering-job-count`
export const detectSpecificRoutePrefixClusteringSpecies = (slug: string): string => `/api/project/${slug}/clustering-species-detected`

// Service
export const apiArbimonGetAedJobCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== '') {
    return await apiClient.get<number>(detectSpecificRoutePrefixAED(slug)).then(res => res.data)
  } else return 0
}

export const apiArbimonGetClusteringJobCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== '') {
    return await apiClient.get<number>(detectSpecificRoutePrefixClustering(slug)).then(res => res.data)
  } else return 0
}

export const apiArbimonGetClusteringSpeciesDetected = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== '') {
    return await apiClient.get<number>(detectSpecificRoutePrefixClusteringSpecies(slug)).then(res => res.data)
  } else return 0
}
