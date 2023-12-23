import fastifyRoutes from '@fastify/routes'
import fastify, { type FastifyInstance, type FastifyReply, type FastifySchema, type HTTPMethods, type preValidationHookHandler, type RawReplyDefaultExpression, type RawRequestDefaultExpression, type RawServerDefault, type RequestBodyDefault, type RequestParamsDefault, type RequestQuerystringDefault, type RouteHandlerMethod } from 'fastify'
import { type ReplyDefault } from 'fastify/types/utils'

import { type ProjectRole } from '@rfcx-bio/common/src/roles'

type FastifyHandler<Response = ReplyDefault, Params = RequestParamsDefault, Querystring = RequestQuerystringDefault, Body = RequestBodyDefault> = RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  { Params: Params, Reply: Response, Querystring: Querystring, Body: Body },
  unknown
>

type FastifyHandlerRequest<Response, Params, Querystring, Body> = Parameters<FastifyHandler<Response, Params, Querystring, Body>>[0]

type Handler<Response = ReplyDefault, Params = RequestParamsDefault, Querystring = RequestQuerystringDefault, Body = RequestBodyDefault> =
  (req: FastifyHandlerRequest<Response, Params, Querystring, Body>, res: FastifyReply) => Promise<Response>

type Middleware<Params = RequestParamsDefault, Querystring = RequestQuerystringDefault, Body = RequestBodyDefault> =
  (req: FastifyHandlerRequest<void, Params, Querystring, Body>, res: FastifyReply) => Promise<void>

interface RouteRegistration<Response = any, Params = any, Querystring = any, Body = any> {
  method: HTTPMethods
  url: string
  schema?: FastifySchema
  preValidation?: preValidationHookHandler[]
  preHandler?: Array<Middleware<Params, Querystring>>
  handler: Handler<Response, Params, Querystring, Body>
}

interface MockAppOptions {
  userToken?: { email?: string, idAuth0?: string, firstName?: string, lastName?: string }
  userId?: number
  projectRole?: ProjectRole
}

export const makeApp = async (routes: RouteRegistration[], options: MockAppOptions = {}): Promise<FastifyInstance> => {
  const userToken = options.userToken ?? null
  const userId = options.userId ?? undefined
  const projectRole = options.projectRole ?? 'none'

  const app = await fastify()
  await app.register(fastifyRoutes)

  app.decorateRequest('userToken', userToken)
  app.decorateRequest('userId', userId)
  app.decorateRequest('projectRole', projectRole)

  routes.forEach(route => app.route(route))

  return app
}
