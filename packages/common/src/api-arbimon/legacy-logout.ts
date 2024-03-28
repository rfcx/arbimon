import { type AxiosInstance } from 'axios'

export const apiArbimonLegacyClearSession = async (apiClient: AxiosInstance): Promise<void> => {
  await apiClient.get('/legacy-logout')
}
