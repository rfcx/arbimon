import { ApiClientError, ApiMissingParam } from '../errors'

/**
 * Validates multiple parameters at once, throwing an error if any of them are undefined.
 * @param params - Pass params as an object, to support shortform properties (simultaneously pass param name and value)
 * @throws ```ApiMissingParam(key)```
 * @example assertParamsExist({ projectId })
 */
export const assertParamsExist = (params: Record<string, string | undefined>): void =>
  Object.entries(params).forEach(
    ([key, value]) => { if (!value) throw ApiMissingParam(key) }
  )

/**
 * Validates multiple parameters at once
 * @param params - Pass params as an object, to support shortform properties (simultaneously pass param name and value)
 * @throws ```ApiClientError(key, value)```
 * @example assertInvalidQuery({ startDate })
 */
export const assertInvalidQuery = (params: Record<string, string | undefined>): void =>
  Object.entries(params).forEach(
    ([key, value]) => { throw ApiClientError(key, value) }
  )
