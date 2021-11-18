class FastifyError extends Error {
  constructor (message: string, public statusCode = 500) { super(message) }
}

export const ApiServerError = (message = 'Server error'): FastifyError =>
  new FastifyError(message, 500)

export const ApiClientError = (message = 'Invalid request'): FastifyError =>
  new FastifyError(message, 400)

export const ApiMissingParam = (paramName: string): FastifyError =>
  new FastifyError(`${paramName} is required`, 400)

export const ApiNotFoundError = (message = 'Data not found'): FastifyError =>
  new FastifyError(message, 404)
