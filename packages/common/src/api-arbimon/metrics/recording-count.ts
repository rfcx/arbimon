import { type AxiosInstance } from 'axios'

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/recordings/count`

// Service
export const apiArbimonGetRecordingCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== '') {
    return await apiClient.get<number>(detectSpecificRoutePrefix(slug)).then(res => res.data)
  } else return 0
}
