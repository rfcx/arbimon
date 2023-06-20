import { type AxiosInstance } from 'axios'

// Request types
export interface PlaylistCountParams {
  slug?: string
}

export const detectSpecificRoutePrefix = (slug: string): string => `/api/project/${slug}/playlist-count`

// Service
export const apiArbimonGetPlaylistCount = async (apiClient: AxiosInstance, params: PlaylistCountParams = {}): Promise<number | undefined> => {
  if (params?.slug !== undefined) {
    return await apiClient.get<number>(detectSpecificRoutePrefix(params?.slug)).then(res => res.data)
  } else return 0
}
