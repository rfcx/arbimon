import fastify, { FastifyInstance, InjectOptions, LightMyRequestResponse } from 'fastify'

import { RouteRegistration } from '~/api-helpers/types'

interface MockOptions {
  routes: RouteRegistration[]
  isProjectMember?: boolean
  memberProjectCoreIds?: string[]
}

export const getMockedFastify = async ({ routes = [], isProjectMember = false, memberProjectCoreIds = [] }: MockOptions): Promise<FastifyInstance> => {
  const app = await fastify()

  const fakeRequestContext = {
    get: (key: string) => ({
      IS_PROJECT_MEMBER: isProjectMember,
      MEMBER_PROJECT_CORE_IDS: memberProjectCoreIds
    })[key],
    set: (key: string, value: any) => {}
  }

  app.decorate('requestContext', fakeRequestContext)
  app.decorateRequest('requestContext', fakeRequestContext)

  routes
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

type InjectFunction = (opts: InjectOptions) => Promise<LightMyRequestResponse>

export const getInjectAsLoggedInProjectMember = async (routes: RouteRegistration[]): Promise<InjectFunction> => {
  const app = await getMockedFastify({ routes, isProjectMember: true })

  return async (opts) => await app.inject({
    headers: { authorization: 'BEARER AbCdEf123456' },
    ...opts
  })
}

export const getInjectAsLoggedInNotProjectMember = async (routes: RouteRegistration[]): Promise<InjectFunction> => {
  const app = await getMockedFastify({ routes })

  return async (opts) => await app.inject({
    headers: { authorization: 'BEARER AbCdEf123456' },
    ...opts
  })
}

export const getInjectAsLoggedOut = async (routes: RouteRegistration[]): Promise<InjectFunction> => {
  const app = await getMockedFastify({ routes })

  return async (opts) => await app.inject(opts)
}

export const getInjectAsInvalidToken = async (routes: RouteRegistration[]): Promise<InjectFunction> => {
  const app = await getMockedFastify({ routes })

  return async (opts) => await app.inject({
    headers: { authorization: 'BANANA AbCdEf123456' }, // not BEARER
    ...opts
  })
}
