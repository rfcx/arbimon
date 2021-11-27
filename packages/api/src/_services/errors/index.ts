class FastifyError extends Error {
  constructor (message: string, public statusCode = 500) { super(message) }
}

export const ApiServerError = (): FastifyError =>
  new FastifyError('Server error', 500)

export const ApiClientError = (): FastifyError =>
  new FastifyError('Invalid request', 400)

export const ApiMissingParam = (paramName: string): FastifyError =>
  new FastifyError(`${paramName} is required`, 400)

export const ApiNotFoundError = (): FastifyError =>
  new FastifyError('Data not found', 404)
