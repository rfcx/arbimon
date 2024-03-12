import { type AxiosInstance } from 'axios'

export const detectProjectsCount = (): string => '/legacy-api/projects-count'
export const detectJobsCount = (): string => '/legacy-api/jobs-count'
export const detectRecordingsCount = (): string => '/legacy-api/recordings-count'
export const detectRecordingsSpeciesCount = (): string => '/legacy-api/recordings-species-count'

export const apiArbimonGetProjectsCount = async (apiClient: AxiosInstance): Promise<number | undefined> => {
  return await apiClient.get<number>(detectProjectsCount()).then(res => res.data)
}

export const apiArbimonGetJobsCount = async (apiClient: AxiosInstance): Promise<number | undefined> => {
  return await apiClient.get<number>(detectJobsCount()).then(res => res.data)
}

export const apiArbimonGetRecordingsCount = async (apiClient: AxiosInstance): Promise<number | undefined> => {
  return await apiClient.get<number>(detectRecordingsCount()).then(res => res.data)
}

export const apiArbimonGetRecordingsSpeciesCount = async (apiClient: AxiosInstance): Promise<number | undefined> => {
  return await apiClient.get<number>(detectRecordingsSpeciesCount()).then(res => res.data)
}
