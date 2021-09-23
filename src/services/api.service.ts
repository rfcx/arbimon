import axios, { AxiosRequestConfig } from 'axios'

import { RequestMethod } from '@/api/endpoints'
import { Auth } from './vuex.service'

const ApiConfig = axios.create({
  timeout: 30 * 1000 // 30 secs
})

export const getAccessToken = async (): Promise<string | undefined> => {
  const auth = Auth.auth.get()
  const token = await auth?.getTokenSilently()
  return token
}

export const getIdToken = async (): Promise<string | undefined> => {
  const auth = Auth.auth.get()
  const token = await auth?.getIdTokenClaims()
  return token?.__raw
}

interface RequestParams {
  url: string
  method: RequestMethod
  headers?: {[x: string]: string}
  data?: any
  config?: AxiosRequestConfig
}

interface AuthHeader { Authorization: string }

class ApiClient {
  async authToken (): Promise<AuthHeader> {
    const token = await getIdToken()
    return {
      Authorization: 'Bearer ' + (token ?? '')
    }
  }

  async request <T = any> ({ url, method, headers, data, config }: RequestParams): Promise<T> {
    try {
      const response = await (async (m) => {
        const reqConfig = {
          ...(config ?? {}),
          headers: {
            ...(headers ?? {}),
            ...await this.authToken()
          }
        }

        switch (method) {
          case 'DELETE': return await m.delete(url, { ...reqConfig, data })
          case 'POST': return await m.post(url, data, reqConfig)
          case 'PATCH': return await m.patch(url, data, reqConfig)
          case 'PUT': return await m.put(url, data, reqConfig)
          default: return await m.get(url, { ...reqConfig, data })
        }
      })(ApiConfig)
      return response.data
    } catch (e) {
      return await Promise.reject(e)
    }
  }
}

const apiClient = new ApiClient()

export default apiClient
