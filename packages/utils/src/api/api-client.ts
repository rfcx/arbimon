import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export const getApiClient = (baseURL: string, getToken?: () => Promise<string>): AxiosInstance => {
  const apiClient = axios.create({
    baseURL,
    timeout: 30 * 1000 // 30 secs
  })

  if (getToken !== undefined) {
    apiClient.interceptors.request.use(async config => {
      const token = await getToken()
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
      return config
    })

    // TODO: Try again ONCE if the request fails with 401
    // apiClient.interceptors.response.use()
  }

  console.log('getApiClient', getToken)
  return apiClient
}

export const apiGetOrUndefined = async <T> (apiClient: AxiosInstance, url: string, config?: AxiosRequestConfig): Promise<T | undefined> => {
  console.log('apiGetOrUndefined', apiClient, url, config)
  return await apiClient.get<T>(url, config)
    .then(res => res.data)
    .catch(() => undefined)
}
