import { FastifyReply, HTTPMethods, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault, RequestParamsDefault, RequestQuerystringDefault, RouteHandlerMethod } from 'fastify'
import { ReplyDefault } from 'fastify/types/utils'

import { NoExtraProperties } from '@rfcx-bio/utils/utility-types'

// For declaring controllers
type FastifyController<Response = ReplyDefault, Params = RequestParamsDefault, Querystring = RequestQuerystringDefault> = RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  { Params: Params, Reply: Response, Querystring: Querystring },
  unknown
>

type FastifyControllerRequest<Response, Params, Querystring> = Parameters<FastifyController<Response, Params, Querystring>>[0]

export type Controller<Response = ReplyDefault, Params = RequestParamsDefault, Querystring = RequestQuerystringDefault> = (req: FastifyControllerRequest<Response, Params, Querystring>, res: FastifyReply) => Promise<NoExtraProperties<Response>>

// For exporting routes
type Route = string

export type RouteRegistration<Response = any, Params = any, Querystring = any> = [
  HTTPMethods,
  Route,
  Controller<Response, Params, Querystring>
]

// Export convenient aliases
export const DELETE: HTTPMethods = 'DELETE'
export const GET: HTTPMethods = 'GET'
export const HEAD: HTTPMethods = 'HEAD'
export const OPTIONS: HTTPMethods = 'OPTIONS'
export const PATCH: HTTPMethods = 'PATCH'
export const POST: HTTPMethods = 'POST'
export const PUT: HTTPMethods = 'PUT'
