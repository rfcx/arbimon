import { type FastifyRequest } from 'fastify'

import { BioPublicError, ERROR_STATUS_CODE } from '~/errors'
import { type Auth0RawDecodedToken, type Auth0UserToken } from './types'

const errorMessages = {
  badHeaderFormat: 'Authorization header should be in format: Bearer [token].',
  expiredToken: 'Expired token.',
  invalidAlgorithm: 'Unsupported token.',
  invalidToken: 'Invalid token.',
  jwksHttpError: 'Unable to get the JWS due to a HTTP error',
  missingHeader: 'Missing Authorization HTTP header.',
  missingKey: 'Missing Key: Public key must be provided',
  missingOptions: 'Please provide at least one of the "jwksUrl" or "secret" options.'
}

const fastifyJwtErrors = [
  ['Format is Authorization: Bearer \\[token\\]', errorMessages.badHeaderFormat],
  ['No Authorization was found in request\\.headers', errorMessages.missingHeader],
  ['token expired', errorMessages.expiredToken],
  ['invalid algorithm', errorMessages.invalidAlgorithm],
  [/(?:jwt malformed)|(?:invalid signature)|(?:jwt (?:audience|issuer) invalid)/, errorMessages.invalidToken]
]

const fastifyJwtVerify = async (request: FastifyRequest): Promise<Auth0RawDecodedToken> => {
  try {
    // TODO: this isn't verifying the token - urgent to fix
    return await request.jwtDecode<Auth0RawDecodedToken>()
    // return await request.jwtVerify<Auth0RawDecodedToken>()
  } catch (e) {
    const typedError = e as { message?: string | null, statusCode?: number | null }
    for (const [jwtMessage, errorMessage] of fastifyJwtErrors) {
      if (typedError.message?.match(jwtMessage)) {
        throw new BioPublicError(errorMessage.toString(), ERROR_STATUS_CODE.unauthorized)
      }
    }

    if (typedError.statusCode != null) {
      throw new BioPublicError('error while verifying the authorization header', typedError.statusCode)
    }

    throw new BioPublicError(typedError.message ?? 'unknown authorization error', ERROR_STATUS_CODE.unauthorized)
  }
}

export const authenticate = async (request: FastifyRequest): Promise<Auth0UserToken> => {
  const decoded = await fastifyJwtVerify(request)
  return {
    idAuth0: decoded.auth0_user_id,
    email: decoded.email,
    firstName: decoded.given_name ?? decoded.name.split(' ').at(0) ?? '',
    lastName: decoded.family_name ?? decoded.name.split(' ').at(-1) ?? ''
  }
}
