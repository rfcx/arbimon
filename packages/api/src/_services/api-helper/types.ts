import { RouteHandlerMethod } from 'fastify'

import { NoExtraProperties } from '../../Z_COMMON/utility-types'

type FastifyController<Params, Response> = RouteHandlerMethod<any, any, any, {
  Params: Partial<Params>
  Reply: Response
}, unknown>

type FastifyControllerReq<Params, Response> = Parameters<FastifyController<Params, Response>>[0]

export type Controller<Params, Response> = (req: FastifyControllerReq<Params, Response>) => Promise<NoExtraProperties<Response>>
