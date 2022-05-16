import fastify, { FastifyInstance } from 'fastify'

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
