import { FastifyRequest } from 'fastify'

import { ACCESSIBLE_CORE_PROJECT_IDS, IS_PROJECT_MEMBER } from '../decorators'

export function isProjectMember (req: FastifyRequest): boolean {
  return req.requestContext.get(IS_PROJECT_MEMBER) === true
}

export function getCoreProjectIds (req: FastifyRequest): string[] | undefined {
  return req.requestContext.get(ACCESSIBLE_CORE_PROJECT_IDS)
}
