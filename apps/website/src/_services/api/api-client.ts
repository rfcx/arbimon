import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

import { useAuthClient } from '~/auth-client'

const axiosClient = axios.create({
  timeout: 30 * 1000 // 30 secs
})

interface AuthHeader { Authorization: string }

class ApiClient {
  async authToken (): Promise<AuthHeader> {
    const token = await useAuthClient().getIdToken()
    return { Authorization: 'Bearer ' + (token ?? '') }
  }

  async request <ResponseBody, RequestBody = undefined> (config: AxiosRequestConfig<RequestBody>): Promise<ResponseBody> {
    const response = await axiosClient.request<ResponseBody, AxiosResponse<ResponseBody, RequestBody>, RequestBody>({
      ...config,
      headers: { ...config.headers, ...await this.authToken() }
    })

    return response.data
  }

  async requestOrUndefined <ResponseBody, RequestBody = undefined> (config: AxiosRequestConfig<RequestBody>): Promise<ResponseBody | undefined> {
    return await this.request<ResponseBody, RequestBody>(config).catch(() => undefined)
  }

  async get <ResponseBody> (url: string): Promise<ResponseBody> {
    return await this.request<ResponseBody>({ url })
  }

  async getOrUndefined <ResponseBody> (url: string, config?: AxiosRequestConfig): Promise<ResponseBody | undefined> {
    return await this.requestOrUndefined<ResponseBody>({ url, ...config })
  }
}

export const apiClient = new ApiClient()
