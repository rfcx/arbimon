import { AxiosRequestConfig, Method } from 'axios'

export type RequestMethod = Method & ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')

export interface Endpoint extends AxiosRequestConfig<any> {
  method: RequestMethod
  url: string
}
