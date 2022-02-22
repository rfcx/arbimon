import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { FastifyLoggerInstance } from 'fastify'

import { env } from '../env'

const axiosClient = axios.create({
  timeout: 30 * 1000 // 30 secs
})

interface AuthHeader { Authorization: string }

export class ApiClient {
  static instance: ApiClient | undefined
  static getInstance (logger: FastifyLoggerInstance): ApiClient {
    if (!ApiClient.instance) { ApiClient.instance = new ApiClient(logger) }
    return ApiClient.instance
  }

  constructor (private readonly logger: FastifyLoggerInstance) {}

  async getAccessToken (): Promise<string> {
    try {
      const auth = await axios.request({
        method: 'POST',
        url: 'https://rfcx.eu.auth0.com/oauth/token',
        headers: {
          'content-type': 'application/json'
        },
        data: {
          grant_type: 'client_credentials',
          client_id: 'LS9wYkLVSJtKMhPvRy0kWTxgyXhc6Ht8',
          client_secret: env.AUTHO_ANONYMOUS_CLIENT_SECRET,
          audience: 'https://rfcx.org/api/v2/'
        }
      })
      return auth.data.access_token
    } catch (err) {
      this.logger.error('RFCx authentication error:', err)
      return ''
    }
  }

  async authToken (): Promise<AuthHeader> {
    const token = await this.getAccessToken()
    return { Authorization: `Bearer ${token}` }
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
