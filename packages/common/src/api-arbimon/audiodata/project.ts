import type { AxiosInstance } from 'axios'

export interface TextResponse {
  message: string
}

export const apiLegacyProjectDelete = async (apiClient: AxiosInstance, slug: string, idCore: string): Promise<TextResponse> => {
  return await apiClient.post(`/legacy-api/project/${slug}/delete`, { external_id: idCore })
}
