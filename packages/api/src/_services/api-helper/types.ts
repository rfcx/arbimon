import { AxiosRequestConfig, Method } from 'axios'
import { RouteHandlerMethod } from 'fastify'
import { NoExtraProperties } from 'TEMP/utility-types'

export type RequestMethod = Method & ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')

// TODO ??? - Extract to utils
export interface Endpoint extends AxiosRequestConfig<any> {
  method: RequestMethod
  url: string
}

type FastifyController<Params, Response> = RouteHandlerMethod<any, any, any, {
  Params: Partial<Params>
  Reply: Response
}, unknown>

type FastifyControllerReq<Params, Response> = Parameters<FastifyController<Params, Response>>[0]

export type Controller<Params, Response> = (req: FastifyControllerReq<Params, Response>) => Promise<NoExtraProperties<Response>>
