import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'

export interface GetApiClientOptions {
  /**
   * Superuser masquerade: when this returns a non-empty email, every request
   * carries `X-Masquerade-Email: <email>`. The bio-api honors it ONLY for a
   * real super token (see apps/api/.../auth0/masquerade.ts), so it is inert
   * for everyone else. Read reactively per-request so start/stop take effect
   * without rebuilding the client.
   */
  getMasqueradeEmail?: () => string | null | undefined
}

export const getApiClient = (baseURL: string, getToken?: () => Promise<string>, options?: GetApiClientOptions): AxiosInstance => {
  const apiClient = axios.create({
    baseURL,
    timeout: 30 * 1000 // 30 secs
  })

  if (getToken !== undefined) {
    apiClient.interceptors.request.use(async config => {
      // `getToken` may return an empty string when the caller wanted to
      // try an authenticated request opportunistically but the SDK had
      // no SSO session to draw on. Skip the Authorization header in that
      // case rather than sending `Bearer ` (which the bio-api treats as
      // an invalid token).
      const token = await getToken()
      if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
      }
      const masqueradeEmail = options?.getMasqueradeEmail?.()
      if (masqueradeEmail !== null && masqueradeEmail !== undefined && masqueradeEmail !== '') {
        config.headers = { ...config.headers, 'X-Masquerade-Email': masqueradeEmail }
      }
      return config
    })

    // TODO: Try again ONCE if the request fails with 401
    // apiClient.interceptors.response.use()
  }

  return apiClient
}

// TODO: Wrap calls with `useQuery`, allow errors to propagate, and delete this function
export const apiGetOrUndefined = async <T> (apiClient: AxiosInstance, url: string, config?: AxiosRequestConfig): Promise<T | undefined> => {
  return await apiClient.get<T>(url, config)
    .then(res => res.data)
    .catch(() => undefined)
}
