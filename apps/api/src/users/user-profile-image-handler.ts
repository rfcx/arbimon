import { type FastifyReply } from 'fastify'

import { type Handler } from '~/api-helpers/types'
import { extractUserId } from '~/auth0/extract-user'
import { getUserProfileImage, patchUserProfileImage } from './user-profile-bll'

export const getUserProfileImageHandler: Handler<FastifyReply> = async (req, rep) => {
  const idAuth0 = await extractUserId(req)
  const profileImage = await getUserProfileImage(idAuth0)
  return await rep.send(profileImage)
}

export const patchUserProfileImageHandler: Handler<string> = async (req, rep) => {
  const idAuth0 = await extractUserId(req)
  const file = await req.file()

  await patchUserProfileImage(idAuth0, file)

  rep.statusCode = 204
  return ''
}
