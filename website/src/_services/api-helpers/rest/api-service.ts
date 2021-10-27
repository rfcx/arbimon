import axios, { AxiosRequestConfig } from 'axios'

import { useAuthClient } from '~/auth'
import { RequestMethod } from './endpoints'

const ApiConfig = axios.create({
  timeout: 30 * 1000 // 30 secs
})

export interface RequestParams<RequestBody> {
  url: string
  method: RequestMethod
  headers?: {[x: string]: string}
  data?: RequestBody
  config?: AxiosRequestConfig
}

interface AuthHeader { Authorization: string }

class ApiClient {
  async authToken (): Promise<AuthHeader> {
    const token = await useAuthClient().getIdToken()
    return { Authorization: 'Bearer ' + (token ?? '') }
  }

  async request <ResponseBody, RequestBody = undefined> ({ url, method, headers, data, config }: RequestParams<RequestBody>): Promise<ResponseBody> {
    try {
      const response = await (async (m) => {
        const reqConfig = {
          config: { ...config },
          headers: { ...headers, ...await this.authToken() }
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

export const apiClient = new ApiClient()
