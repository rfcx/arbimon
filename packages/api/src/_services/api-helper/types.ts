import { AxiosRequestConfig, Method } from 'axios'

export type RequestMethod = Method & ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')

// TODO ??? - Extract to utils
export interface Endpoint extends AxiosRequestConfig<any> {
  method: RequestMethod
  url: string
}
