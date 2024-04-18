import { type AxiosInstance } from 'axios'

export const apiArbimonLegacyClearSession = async (apiClient: AxiosInstance): Promise<void> => {
  const response = await apiClient.get('/legacy-logout?redirect=false')
  return response.data
}
