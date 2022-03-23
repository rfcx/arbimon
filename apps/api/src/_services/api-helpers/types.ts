import { FastifyReply, FastifySchema, HTTPMethods, preValidationHookHandler, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault, RequestParamsDefault, RequestQuerystringDefault, RouteHandlerMethod } from 'fastify'
import { ReplyDefault } from 'fastify/types/utils'

import { NoExtraProperties } from '@rfcx-bio/utils/utility-types'

// For declaring handlers
type FastifyHandler<Response = ReplyDefault, Params = RequestParamsDefault, Querystring = RequestQuerystringDefault> = RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  { Params: Params, Reply: Response, Querystring: Querystring },
  unknown
>

type FastifyHandlerRequest<Response, Params, Querystring> = Parameters<FastifyHandler<Response, Params, Querystring>>[0]

export type Handler<Response = ReplyDefault, Params = RequestParamsDefault, Querystring = RequestQuerystringDefault> =
  (req: FastifyHandlerRequest<Response, Params, Querystring>, res: FastifyReply) => Promise<NoExtraProperties<Response>>

export type Middleware<Params = RequestParamsDefault, Querystring = RequestQuerystringDefault> =
  (req: FastifyHandlerRequest<void, Params, Querystring>, res: FastifyReply) => Promise<void>

// For exporting routes
export interface RouteRegistration<Response = any, Params = any, Querystring = any> {
  method: HTTPMethods
  url: string
  schema?: FastifySchema
  preValidation?: preValidationHookHandler[]
  preHandler?: Array<Middleware<Params, Querystring>>
  handler: Handler<Response, Params, Querystring>
}

// Export convenient aliases
export const DELETE: HTTPMethods = 'DELETE'
export const GET: HTTPMethods = 'GET'
export const HEAD: HTTPMethods = 'HEAD'
export const OPTIONS: HTTPMethods = 'OPTIONS'
export const PATCH: HTTPMethods = 'PATCH'
export const POST: HTTPMethods = 'POST'
export const PUT: HTTPMethods = 'PUT'
