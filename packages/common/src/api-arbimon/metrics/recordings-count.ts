import { type AxiosInstance } from 'axios'

export const detectRecordingsCount = (): string => '/legacy-api/recordings-count'

export const apiArbimonGetRecordingsCount = async (apiClient: AxiosInstance): Promise<number | undefined> => {
  return await apiClient.get<number>(detectRecordingsCount()).then(res => res.data)
}
