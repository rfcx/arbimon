import { type AxiosInstance } from 'axios'

// Service
export const apiArbimonGetSpeciesCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== undefined) {
    return await apiClient.get<number>(`/legacy-api/project/${slug}/species-count`).then(res => res.data)
  } else return 0
}
