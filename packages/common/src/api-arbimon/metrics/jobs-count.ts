import { type AxiosInstance } from 'axios'

export const detectJobsCount = (): string => '/legacy-api/project/jobs-count'

export const apiArbimonGetJobsCount = async (apiClient: AxiosInstance): Promise<number | undefined> => {
  return await apiClient.get<number>(detectJobsCount()).then(res => res.data)
}
