import { FastifyRequest } from 'fastify'

export function isProjectMember (req: FastifyRequest): boolean {
  return req.requestContext.get('projectPermission') !== undefined
}
