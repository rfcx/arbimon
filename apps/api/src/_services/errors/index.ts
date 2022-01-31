class FastifyError extends Error {
  constructor (message: string, public statusCode = 500) { super(message) }
}

export const ApiServerError = (): FastifyError =>
  new FastifyError('Server error', 500)

export const ApiClientError = (queryName: string, queryValue: string | undefined): FastifyError =>
  new FastifyError(`Invalid request '${queryName}' with value: ${String(queryValue)}`, 400)

export const ApiMissingParam = (paramName: string): FastifyError =>
  new FastifyError(`${paramName} is required`, 400)

export const ApiUnauthorized = (): FastifyError =>
  new FastifyError('Unauthorized', 401)

export const ApiPermissionDenied = (): FastifyError =>
  new FastifyError('Permission denied', 403)

export const ApiNotFoundError = (): FastifyError =>
  new FastifyError('Data not found', 404)
