import { type FastifyRequest } from 'fastify'

import { type Auth0UserInfo } from './types'

export const extractUserInformation = async (req: FastifyRequest): Promise<Auth0UserInfo> => {
  const auth0UserInfo = await req.jwtDecode<Auth0UserInfo>()
  return auth0UserInfo
}
