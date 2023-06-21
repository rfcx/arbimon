import { type AxiosInstance } from 'axios'

// Request types
export interface SoundscapeCountParams {
  slug?: string
}

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/soundscape-job-count`

// Service
export const apiArbimonGetSoundscapeCount = async (apiClient: AxiosInstance, params: SoundscapeCountParams = {}): Promise<number | undefined> => {
  if (params?.slug !== undefined) {
    return await apiClient.get<number>(detectSpecificRoutePrefix(params?.slug)).then(res => res.data)
  } else return 0
}
