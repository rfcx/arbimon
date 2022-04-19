import { FastifyRequest } from 'fastify'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { isValidToken } from '~/api-helpers/is-valid-token'
import { BioForbiddenError, BioMissingPathParamError, BioMissingQueryParamError, BioUnauthorizedError } from '../errors'

/**
 * Validates multiple parameters at once, throwing an error if any of them are undefined.
 * @param params - Pass params as an object, to support shortform properties (simultaneously pass param name and value)
 * @throws ```ApiMissingParam(key)```
 * @example assertParamsExist({ projectId })
 */
export const assertPathParamsExist = (params: Record<string, string | undefined>): void =>
  Object.entries(params).forEach(
    ([key, value]) => { if (!value) throw BioMissingPathParamError(key) }
  )

/**
 * Validates multiple parameters at once, throwing an error if any of them are undefined.
 * @param params - Pass params as an object, to support shortform properties (simultaneously pass param name and value)
 * @throws ```ApiMissingParam(key)```
 * @example assertParamsExist({ projectId })
 */
export const assertQueryParamsExist = (params: Record<string, string | undefined>): void =>
  Object.entries(params).forEach(
    ([key, value]) => { if (!value) throw BioMissingQueryParamError(key) }
  )

/**
 * Validated both the presence of a valid token & the access it grants
 */
export const assertAuthorizedForProject = (req: FastifyRequest): void => {
  // TODO: Move API query here instead of in the pre-handler
  const token = req.headers.authorization
  if (token === undefined || !isValidToken(token)) throw BioUnauthorizedError()

  if (!(getIsProjectMember(req))) throw BioForbiddenError()
}
