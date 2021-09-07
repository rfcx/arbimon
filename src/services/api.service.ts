import axios, { AxiosRequestConfig } from 'axios'

import { IdToken } from '@auth0/auth0-spa-js'

import { RequestMethod } from '@/endpoints'
import { Auth } from './vuex.service'

const ApiConfig = axios.create({
  timeout: 30 * 1000 // 30 secs
})

export const getAccessToken = async (): Promise<string | undefined> => {
  const auth = Auth.auth.get()
  const token = await auth?.getTokenSilently()
  return token
}

export const getIdToken = async (): Promise<IdToken | undefined> => {
  const auth = Auth.auth.get()
  const token = await auth?.getIdTokenClaims()
  return token
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
  authToken = async (): Promise<AuthHeader> => {
    const auth = Auth.auth.get()
    const token = await auth?.getTokenSilently()
    return {
      Authorization: 'Bearer ' + (token ?? '')
    }
  }

  request = async ({ url, method, headers, data, config }: RequestParams): Promise<any> => {
    try {
      const response = await (async (m) => {
        const reqConfig = {
          ...(config ?? {}),
          headers: {
            ...(headers ?? {}),
            ...this.authToken()
          }
        }

        switch (method) {
          case 'DELETE': return await m.delete(url, { ...reqConfig, data })
          case 'POST': return await m.post(url, data, reqConfig)
          case 'PATCH': return await m.patch(url, data, reqConfig)
          case 'PUT': return await m.put(url, data, reqConfig)
          case 'GET': return await m.get(url, { ...reqConfig, data })
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
