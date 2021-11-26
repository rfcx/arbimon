import { ApiMissingParam } from '_services/errors'

/**
 * Validates multiple parameters at once, throwing an error if any of them are undefined.
 * @param params - Pass params as an object, to support shortform properties (simultaneously pass param name and value)
 * @throws ```new FastifyError(`${paramName} is required`, 400)```
 * @example assertParamsExist({ projectId })
 */
export const assertParamsExist = (params: Record<string, string | undefined>): void =>
  Object.entries(params).forEach(
    ([key, value]) => { if (!value) throw ApiMissingParam(key) }
  )
