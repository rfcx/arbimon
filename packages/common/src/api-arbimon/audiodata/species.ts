import type { AxiosInstance } from 'axios'

export interface SpeciesResponse {
  count?: number
  list?: any[]
}

export interface SpeciesClassesParams {
  limit: number
  offset: number
  q: string
}

export const apiArbimonGetSpeciesClasses = async (apiClient: AxiosInstance, slug: string, params: SpeciesClassesParams): Promise<SpeciesResponse[] | undefined> => {
  if (slug !== undefined) {
    const response = await apiClient.request<SpeciesResponse[]>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/classes`,
      params
    })
    return response.data
  } else return undefined
}
