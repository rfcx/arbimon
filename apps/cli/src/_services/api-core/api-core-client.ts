import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

// TODO: Write a generic client & move it to common
export class ApiCoreClient {
  static instance: ApiCoreClient | undefined

  static getInstance (clientSecret: string): ApiCoreClient {
    if (!ApiCoreClient.instance) { ApiCoreClient.instance = new ApiCoreClient(clientSecret) }
    return ApiCoreClient.instance
  }

  axiosClient = axios.create({
    timeout: 30 * 1000 // 30 secs
  })

  constructor (private readonly clientSecret: string) {}

  async getAccessToken (): Promise<string | undefined> {
    try {
      const auth = await axios.request({
        method: 'POST',
        url: 'https://rfcx.eu.auth0.com/oauth/token', // TODO: Make this env
        headers: {
          'content-type': 'application/json'
        },
        data: {
          grant_type: 'client_credentials',
          client_id: 'LS9wYkLVSJtKMhPvRy0kWTxgyXhc6Ht8', // TODO: Make this env
          client_secret: this.clientSecret,
          audience: 'https://rfcx.org/api/v2/'
        }
      })
      return auth.data.access_token
    } catch (err) {
      console.error(err)
      return undefined
    }
  }

  async authToken (): Promise<{ Authorization: string } | undefined> {
    const token = await this.getAccessToken()
    if (!token) return undefined
    return { Authorization: `Bearer ${token}` }
  }

  async requestRaw <ResponseBody, RequestBody = undefined> (config: AxiosRequestConfig<RequestBody>): Promise<AxiosResponse<ResponseBody, RequestBody>> {
    const response = await this.axiosClient.request<ResponseBody, AxiosResponse<ResponseBody, RequestBody>, RequestBody>({
      ...config,
      headers: { ...config.headers, ...await this.authToken() }
    })

    return response
  }

  async request <ResponseBody, RequestBody = undefined> (config: AxiosRequestConfig<RequestBody>): Promise<ResponseBody> {
    return await this.requestRaw<ResponseBody, RequestBody>(config).then(res => res.data)
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
