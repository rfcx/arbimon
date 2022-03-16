import { FastifyLoggerInstance } from 'fastify'

import { getProjectPermission } from '../api-core/api-core'
import { BioPublicError, ERROR_STATUS_CODE } from '../errors'

export const isValidToken = (token: string): boolean => /^Bearer ./i.test(token) // at least 1 character after space

export async function isProjectMember (logger: FastifyLoggerInstance, id: string, token: string): Promise<boolean> {
  if (!isValidToken(token)) return false

  return await getProjectPermission(id, token)
    .then(() => true)
    .catch(err => {
      // Forbidden is expected (it means the user is not a project member)
      if (err instanceof BioPublicError && err.statusCode === ERROR_STATUS_CODE.forbidden) return false

      // Log unexpected errors
      logger.error(err)
      return false
    })
}
