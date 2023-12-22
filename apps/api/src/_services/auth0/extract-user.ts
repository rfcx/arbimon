import { type FastifyRequest } from 'fastify'

import { type Auth0RawDecodedToken } from './types'

export const extractUserId = async (req: FastifyRequest): Promise<string> => {
  const auth0UserInfo = await req.jwtDecode<Auth0RawDecodedToken>()
  return auth0UserInfo.auth0_user_id
}
