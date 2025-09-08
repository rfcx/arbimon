import type { AxiosInstance } from 'axios'

export interface SpeciesResponse {
  count?: number
  list?: SpeciesType[]
}

export interface SpeciesType {
  id: number
  projectId: number
  songTypeId: number
  songTypeName: string
  speciesId: number
  speciesName: string
  taxon: string
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
