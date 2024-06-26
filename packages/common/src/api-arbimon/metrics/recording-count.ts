import { type AxiosInstance } from 'axios'

// Service
export const apiArbimonGetRecordingCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== undefined) {
    return await apiClient.get<number>(`/legacy-api/project/${slug}/recordings/count`).then(res => res.data)
  } else return undefined
}
