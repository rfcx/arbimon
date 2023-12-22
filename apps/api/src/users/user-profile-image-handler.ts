import { type FastifyReply } from 'fastify'

import { type Handler } from '~/api-helpers/types'
import { type Auth0UserToken } from '~/auth0/types'
import { getUserProfileImage, patchUserProfileImage } from './user-profile-bll'

export const getUserProfileImageHandler: Handler<FastifyReply> = async (req, rep) => {
  const profileImage = await getUserProfileImage(req.userId as number) // TODO: use userId to get profile image

  // cache image for 5 minutes
  void rep.header('cache-control', 'public, s-maxage: 300')
  return await rep.send(profileImage)
}

export const patchUserProfileImageHandler: Handler<string> = async (req, rep) => {
  const file = await req.file()
  await patchUserProfileImage(req.headers.authorization as string, (req.userToken as Auth0UserToken).email, req.userId as number, file) // TODO: use userId to get profile image

  rep.statusCode = 204
  return ''
}
