import { type AxiosInstance } from 'axios'

// Request types
export interface SoundscapeCountParams {
  slug?: string
}

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/soundscape-job-count`

// Service
export const apiArbimonGetSoundscapeCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== '') {
    return await apiClient.get<number>(detectSpecificRoutePrefix(slug)).then(res => res.data)
  } else return 0
}
