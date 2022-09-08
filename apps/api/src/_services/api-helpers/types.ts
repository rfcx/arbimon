import { FastifyReply, FastifySchema, HTTPMethods, preValidationHookHandler, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault, RequestBodyDefault, RequestParamsDefault, RequestQuerystringDefault, RouteHandlerMethod } from 'fastify'
import { ReplyDefault } from 'fastify/types/utils'

import { NoExtraProps } from '@rfcx-bio/utils/utility-types'

// For declaring handlers
type FastifyHandler<Response = ReplyDefault, Params = RequestParamsDefault, Querystring = RequestQuerystringDefault, Body = RequestBodyDefault> = RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  { Params: Params, Reply: Response, Querystring: Querystring, Body: Body },
  unknown
>

type FastifyHandlerRequest<Response, Params, Querystring, Body> = Parameters<FastifyHandler<Response, Params, Querystring, Body>>[0]

export type Handler<Response = ReplyDefault, Params = RequestParamsDefault, Querystring = RequestQuerystringDefault, Body = RequestBodyDefault> =
  (req: FastifyHandlerRequest<Response, Params, Querystring, Body>, res: FastifyReply) => Promise<NoExtraProps<Response>>

export type Middleware<Params = RequestParamsDefault, Querystring = RequestQuerystringDefault, Body = RequestBodyDefault> =
  (req: FastifyHandlerRequest<void, Params, Querystring, Body>, res: FastifyReply) => Promise<void>

// For exporting routes
export interface RouteRegistration<Response = any, Params = any, Querystring = any, Body = any> {
  method: HTTPMethods
  url: string
  schema?: FastifySchema
  preValidation?: preValidationHookHandler[]
  preHandler?: Array<Middleware<Params, Querystring>>
  handler: Handler<Response, Params, Querystring, Body>
}

// Export convenient aliases
export const DELETE: HTTPMethods = 'DELETE'
export const GET: HTTPMethods = 'GET'
export const HEAD: HTTPMethods = 'HEAD'
export const OPTIONS: HTTPMethods = 'OPTIONS'
export const PATCH: HTTPMethods = 'PATCH'
export const POST: HTTPMethods = 'POST'
export const PUT: HTTPMethods = 'PUT'
