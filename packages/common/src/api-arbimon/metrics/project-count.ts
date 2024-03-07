import { type AxiosInstance } from 'axios'

export const detectProjectsCount = (): string => '/legacy-api/project/projects-count'

export const apiArbimonGetProjectsCount = async (apiClient: AxiosInstance): Promise<number | undefined> => {
  return await apiClient.get<number>(detectProjectsCount()).then(res => res.data)
}
