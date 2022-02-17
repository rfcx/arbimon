import { BioMissingPathParamError, BioMissingQueryParamError } from '../errors'

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
