import { type AxiosInstance } from 'axios'

export const detectRecordingsSpeciesCount = (): string => '/legacy-api/recordings-species-count'

export const apiArbimonGetRecordingsSpeciesCount = async (apiClient: AxiosInstance): Promise<number | undefined> => {
  return await apiClient.get<number>(detectRecordingsSpeciesCount()).then(res => res.data)
}
