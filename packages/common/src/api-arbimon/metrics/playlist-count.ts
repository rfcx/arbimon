import { type AxiosInstance } from 'axios'

// Request types
export interface PlaylistCountParams {
  slug?: string
}

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/playlist-count`

// Service
export const apiArbimonGetPlaylistCount = async (apiClient: AxiosInstance, slug: string): Promise<number | undefined> => {
  if (slug !== undefined) {
    return await apiClient.get<number>(detectSpecificRoutePrefix(slug)).then(res => res.data)
  } else return 0
}
