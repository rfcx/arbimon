import { AxiosRequestConfig, Method } from 'axios'
import { RouteHandlerMethod } from 'fastify'

export type RequestMethod = Method & ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')

// TODO ??? - Extract to utils
export interface Endpoint extends AxiosRequestConfig<any> {
  method: RequestMethod
  url: string
}

export type Controller<Params, Response> = RouteHandlerMethod<any, any, any, {
  Params: Partial<Params>
  Reply: Response
}, unknown>
