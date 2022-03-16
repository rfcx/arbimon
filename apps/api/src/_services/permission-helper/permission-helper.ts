import { FastifyRequest } from 'fastify'

import { IS_PROJECT_MEMBER } from '../decorators'

export function isProjectMember (req: FastifyRequest): boolean {
  return req.requestContext.get(IS_PROJECT_MEMBER) === true
}
