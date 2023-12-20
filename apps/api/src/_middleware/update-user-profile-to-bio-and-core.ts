import { type FastifyRequest } from 'fastify'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { extractUserInformation } from '~/auth0/extract-auth0-object'
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
  missingOptions: 'Please provide at least one of the "jwksUrl" or "secret" options.'
}

const fastifyJwtErrors = [
  ['Format is Authorization: Bearer \\[token\\]', errorMessages.badHeaderFormat],
  ['No Authorization was found in request\\.headers', errorMessages.missingHeader],
  ['token expired', errorMessages.expiredToken],
  ['invalid algorithm', errorMessages.invalidAlgorithm],
  [/(?:jwt malformed)|(?:invalid signature)|(?:jwt (?:audience|issuer) invalid)/, errorMessages.invalidToken]
]

/**
 * Attempts to find valid strings from the given parameters from the first one to last one.
 * Ignores empty strings and `undefined`s. If the string cannot be found. Empty string is then returned
 */
const findValidString = (...strings: Array<string | undefined>): string => {
  for (const parameter of strings) {
    if (parameter === null || parameter === undefined || parameter === '') {
      continue
    }
    return parameter
  }

  return ''
}

export const updateUserProfileToBio = async (req: FastifyRequest): Promise<void> => {
  const sequelize = getSequelize()
  const { UserProfile } = ModelRepository.getInstance(sequelize)

  // passthrough when authorization header is missing (not logged in user)
  // req.extractedUser will be null originally
  if (req.headers.authorization == null || req.headers.authorization === '') {
    return
  }

  // Since we use Basic Auth in dev environment sometimes the headers sent is basic.
  // We need to skip this.
  // TODO: Take a look at this comment
  if (!isValidToken(req.headers.authorization)) {
    return
  }

  // if the expression throws, return 403
  // req.extractedUser will have value.
  try {
    const decoded = await req.jwtDecode<Auth0UserInfo>()
    req.extractedUser = decoded
  } catch (e) {
    req.extractedUser = null

    for (const [jwtMessage, errorMessage] of fastifyJwtErrors) {
      // @ts-expect-error we have the guard catch already
      if (e?.message != null && (e.message as string).match(jwtMessage)) {
        throw new BioPublicError(errorMessage.toString(), 403)
      }
    }

    // @ts-expect-error we have the guards up.
    if (e?.statusCode != null) {
      // @ts-expect-error we have the guards up.
      throw new BioPublicError('error while verifying the authorization header', e.statusCode)
    }

    // @ts-expect-error we have the guards up.
    throw new BioPublicError(e?.message, 403)
  }

  // Find user inside the cache
  // Cannot use `req.user` since it will be always null because we did not call `req.jwtVerify()`
  const auth0User = await extractUserInformation(req)
  const userCacheHit = req.lru.get(auth0User.email)
  req.extractedUser = auth0User

  // If user is found in cache. Passthrough the request since he should be also in the db already.
  if (userCacheHit != null) {
    return
  }

  // non existent guys will get pushed into the db and the cache.
  const user = await UserProfile.findOne({ where: { email: auth0User.email } })
  if (user == null) {
    const firstName = findValidString(auth0User?.given_name, auth0User?.user_metadata?.given_name, auth0User?.['https://rfcx.org/user_metadata']?.given_name)
    const lastName = findValidString(auth0User?.family_name, auth0User?.user_metadata?.family_name, auth0User?.['https://rfcx.org/user_metadata']?.family_name)

    const newUser = await UserProfile.create({
      idAuth0: auth0User.auth0_user_id,
      firstName,
      lastName,
      email: auth0User.email,
      image: auth0User.picture ?? undefined,
      organizationIdAffiliated: undefined
    })

    req.lru.set(auth0User.email, {
      id: newUser.get('id'),
      idAuth0: auth0User.auth0_user_id,
      firstName,
      lastName,
      email: auth0User.email,
      image: auth0User.picture ?? undefined,
      organizationIdAffiliated: undefined
    })

    return
  }

  // If the guy exists but the auth0 id is null, we update his auth0 id
  if (user.get('idAuth0') == null) {
    await sequelize.query(
      'update user_profile set id_auth0 = $1 where email = $2',
      { bind: [auth0User.auth0_user_id, auth0User.email] }
    )
  }

  // If user exists. get him in the cache and continue
  req.lru.set(user.get('email'), {
    id: user.id,
    idAuth0: user.idAuth0,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    image: user.image,
    organizationIdAffiliated: user.organizationIdAffiliated
  })
}
