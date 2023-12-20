import { type FastifyReply } from 'fastify'

import { type Handler } from '~/api-helpers/types'
import { BioUnauthorizedError } from '~/errors'
import { getUserProfileImage, patchUserProfileImage } from './user-profile-bll'

export const getUserProfileImageHandler: Handler<FastifyReply> = async (req, rep) => {
  // If this is null then you don't have the token from the start.
  if (req.extractedUser === null) {
    throw BioUnauthorizedError()
  }

  const profileImage = await getUserProfileImage(req.extractedUser.email)

  // cache image for 5 minutes
  void rep.header('cache-control', 'public, s-maxage: 300')
  return await rep.send(profileImage)
}

export const patchUserProfileImageHandler: Handler<string> = async (req, rep) => {
  if (req.headers.authorization == null || req.headers.authorization === '') {
    throw BioUnauthorizedError()
  }

  if (req.extractedUser === null) {
    throw BioUnauthorizedError()
  }

  const file = await req.file()
  await patchUserProfileImage(req.headers.authorization, req.extractedUser.email, file)

  rep.statusCode = 204
  return ''
}
