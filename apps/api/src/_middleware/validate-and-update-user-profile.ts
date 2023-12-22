import { type FastifyRequest } from 'fastify'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Auth0UserInfo } from '~/auth0/types'
import { getSequelize } from '~/db'
import { BioPublicError } from '~/errors'

const errorMessages = {
  badHeaderFormat: 'Authorization header should be in format: Bearer [token].',
  expiredToken: 'Expired token.',
  invalidAlgorithm: 'Unsupported token.',
  invalidToken: 'Invalid token.',
  jwksHttpError: 'Unable to get the JWS due to a HTTP error',
  missingHeader: 'Missing Authorization HTTP header.',
  missingKey: 'Missing Key: Public key must be provided',
  missingOptions:
    'Please provide at least one of the "jwksUrl" or "secret" options.'
}

/**
 * Attempts to find valid strings from the given parameters from the first one to last one.
 * Ignores empty strings and `undefined`s. If the string cannot be found. Empty string is then returned
 */
const findValidString = (...strings: Array<string | undefined>): string => {
  for (const parameter of strings) {
    // INFO: Since we're working with json value. Null checks are needed
    if (parameter === null || parameter === undefined || parameter === '') {
      continue
    }
    return parameter
  }

  return ''
}

export const fastifyJwtErrors = [
  [
    'Format is Authorization: Bearer \\[token\\]',
    errorMessages.badHeaderFormat
  ],
  [
    'No Authorization was found in request\\.headers',
    errorMessages.missingHeader
  ],
  ['token expired', errorMessages.expiredToken],
  ['invalid algorithm', errorMessages.invalidAlgorithm],
  [
    /(?:jwt malformed)|(?:invalid signature)|(?:jwt (?:audience|issuer) invalid)/,
    errorMessages.invalidToken
  ]
]

export const validateAndUpdateUserProfile = async (req: FastifyRequest): Promise<void> => {
  const sequelize = getSequelize()
  const { UserProfile } = ModelRepository.getInstance(sequelize)
  const authorization = req.headers.authorization

  if (authorization === undefined || authorization === '' || !isValidToken(authorization)) {
    return
  }

  try {
    const decoded = await req.jwtVerify<Auth0UserInfo>()
    const userInCache = req.lru.get(decoded.email)

    if (userInCache !== undefined) {
      req.extractedUser = {
        auth0_user_id: decoded.auth0_user_id,
        id: userInCache.id,
        email: userInCache.email
      }

      return
    }

    const userInDatabase = await UserProfile.findOne({ where: { email: decoded.email } })
    if (userInDatabase !== null) {
      const extractedUser = {
        auth0_user_id: decoded.auth0_user_id,
        id: userInDatabase.id,
        email: decoded.email
      }

      req.extractedUser = extractedUser
      req.lru.set(decoded.email, extractedUser)
      return
    }

    const firstName = findValidString(decoded?.given_name, decoded?.user_metadata?.given_name, decoded?.['https://rfcx.org/user_metadata']?.given_name)
    const lastName = findValidString(decoded?.family_name, decoded?.user_metadata?.family_name, decoded?.['https://rfcx.org/user_metadata']?.family_name)

    const newUser = await UserProfile.create({
      idAuth0: decoded.auth0_user_id,
      firstName,
      lastName,
      email: decoded.email,
      image: decoded.picture ?? undefined,
      organizationIdAffiliated: undefined
    }, { returning: true })

    const extractedUser = {
      auth0_user_id: decoded.auth0_user_id,
      email: decoded.email,
      id: newUser.id
    }

    req.lru.set(decoded.email, extractedUser)
    req.extractedUser = extractedUser
  } catch (e) {
    for (const [jwtMessage, errorMessage] of fastifyJwtErrors) {
      // @ts-expect-error we have the guard catch already
      if (e?.message != null && (e.message as string).match(jwtMessage)) {
        throw new BioPublicError(errorMessage.toString(), 401)
      }
    }

    // @ts-expect-error we have the guards up.
    if (e?.statusCode != null) {
      // @ts-expect-error we have the guards up.
      throw new BioPublicError('error while verifying the authorization header', e.statusCode)
    }

    // @ts-expect-error we have the guards up.
    throw new BioPublicError(e?.message, 401)
  }
}
