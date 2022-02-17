/**
 * WARNING: Public (client-facing) errors must not expose internals
 */

export class BioPublicError extends Error {
  constructor (message: string, public statusCode = 500) { super(message) }
}

// Data access
export const BioUnauthorizedError = (): BioPublicError =>
  new BioPublicError('Unauthorized', 401)

export const BioForbiddenError = (): BioPublicError =>
  new BioPublicError('Forbidden', 403)

export const BioNotFoundError = (): BioPublicError =>
  new BioPublicError('Data not found', 404)

// Malformed requests
export const BioMissingPathParamError = (...pathParamNames: string[]): BioPublicError =>
  new BioPublicError(`Missing required path params: ${pathParamNames.join(', ')}`, 400)

export const BioMissingQueryParamError = (...queryParamNames: string[]): BioPublicError =>
  new BioPublicError(`Missing required query params: ${queryParamNames.join(', ')}`, 400)

export const BioInvalidPathParamError = (params: Record<string, any>): BioPublicError =>
  new BioPublicError(`Invalid path params: ${Object.entries(params).map(([key, value]) => `${key} with value: ${String(value)}`).join(', ')}`, 400)

export const BioInvalidQueryParamError = (params: Record<string, any>): BioPublicError =>
  new BioPublicError(`Invalid query params: ${Object.entries(params).map(([key, value]) => `${key} with value: ${String(value)}`).join(', ')}`, 400)

// Server errors
export const ApiServerError = (): BioPublicError =>
  new BioPublicError('Server error', 500)
// DO NOT ADD MORE SERVER ERRORS -- THE CLIENT DOESN'T NEED DETAILS
