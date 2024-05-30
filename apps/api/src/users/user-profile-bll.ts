import { type MultipartFile } from '@fastify/multipart'
import axios from 'axios'
import { createHash, randomBytes } from 'node:crypto'
import { extname } from 'node:path'
import { URL } from 'node:url'

import { type CoreUser } from '@rfcx-bio/common/api-core/project/users'
import { type OrganizationTypes, type UserProfile, type UserTypes } from '@rfcx-bio/node-common/dao/types'
import { resizeImage } from '@rfcx-bio/node-common/image'

import { patchUserProfileOnCore } from '~/api-core/api-core'
import { type Auth0UserToken } from '~/auth0/types'
import { BioNotFoundError } from '~/errors'
import { fileUrl } from '~/format-helpers/file-url'
import { getS3Client } from '~/storage'
import { create, get, getAllOrganizations as daoGetAllOrganizations, getIdByEmail, query, update } from './user-profile-dao'

export const USER_CONFIG = {
  image: {
    thumbnail: {
      width: 144,
      height: 144,
      // 7 days
      cacheControl: 'max-age=604800, s-maxage=604800'
    },
    original: {
      // 7 days
      cacheControl: 'max-age=604800, s-maxage=604800'
    }
  }
}

const storageClient = getS3Client()

export const getUsers = async (emailLike: string): Promise<Array<UserTypes['light']>> =>
  await query({ emailLike })

export const getUserProfile = async (id: number): Promise<Omit<UserProfile, 'id' | 'idAuth0'>> => {
  const profile = await get(id)

  if (profile === undefined) {
    throw BioNotFoundError()
  }

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    image: fileUrl(profile.image),
    organizationIdAffiliated: profile.organizationIdAffiliated
  }
}

export const patchUserProfile = async (token: string, authToken: Auth0UserToken, id: number, data: Partial<Omit<UserProfile, 'id' | 'idAuth0' | 'image' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const { email, idAuth0 } = authToken
  const originalProfile = await getUserProfile(id)
  const newProfile = { ...originalProfile, ...data }

  const coreProfile: Pick<CoreUser, 'firstname' | 'lastname' | 'picture'> = {
    firstname: newProfile.firstName,
    lastname: newProfile.lastName,
    picture: fileUrl(newProfile.image) ?? null
  }

  if (isAuth0(idAuth0)) {
    await patchUserProfileOnCore(token, email, coreProfile)
  }
  await update(email, newProfile)
}

export const getUserProfileImage = async (id: number): Promise<Buffer> => {
  const userProfile = await get(id)
  if (userProfile === undefined || userProfile.image === undefined) {
    throw BioNotFoundError()
  }

  // Parse the image to url constructor to test if it's a s3 path or a url
  try {
    const imageUrl = new URL(userProfile.image)
    const response = await axios.request({
      method: 'GET',
      url: imageUrl.toString(),
      responseType: 'arraybuffer'
    })

    const imageBuffer = Buffer.from(response.data, 'binary')
    return imageBuffer
  } catch (e) {
    // parse failed because it's an s3 image path
    return await storageClient.getObject(userProfile.image) as Buffer
  }
}

export const patchUserProfileImage = async (token: string, email: string, id: number, file: MultipartFile): Promise<void> => {
  const originalProfile = await getUserProfile(id)

  // hash the email to sha256 and use that as the folder name for storing the profile-image
  const hash = createHash('sha256')
  hash.update(email)
  const hexEmail = hash.digest('hex')

  const uniqueId = randomBytes(4).toString('hex')
  const image = await file.toBuffer()
  const { thumbnail: thumbnailConfig, original: originalConfig } = USER_CONFIG.image
  const imagePath = `users/${hexEmail}/profile-image-${uniqueId}${extname(file.filename)}`
  const thumbnailPath = `users/${hexEmail}/profile-image-${uniqueId}.thumbnail${extname(file.filename)}`
  const thumbnail = await resizeImage(image, thumbnailConfig)
  const newProfile = { ...originalProfile, image: imagePath }

  const coreProfile = {
    firstname: newProfile.firstName,
    lastname: newProfile.lastName,
    picture: fileUrl(newProfile.image) ?? null
  }
  await patchUserProfileOnCore(token, email, coreProfile)
  await storageClient.putObject(imagePath, image, { ContentType: file.mimetype, ACL: 'public-read', CacheControl: originalConfig.cacheControl })
  await storageClient.putObject(thumbnailPath, thumbnail, { ContentType: file.mimetype, ACL: 'public-read', CacheControl: thumbnailConfig.cacheControl })
  await update(email, newProfile)
}

export const findOrCreateUserId = async (email: string, userInfo: Omit<UserProfile, 'id' | 'email'>): Promise<number> => {
  return await getIdByEmail(email).then(async (id) => id ?? await create({ email, ...userInfo }))
}

// TODO: Move to new organizations-bll.ts
export const getAllOrganizations = async (): Promise<Array<OrganizationTypes['light']>> => {
  const organizations = await daoGetAllOrganizations()
  if (organizations === undefined) {
    throw BioNotFoundError()
  }
  return organizations
}

const isAuth0 = (id: string): boolean => {
  const prefix = id.split('|')[0]
  return prefix === 'auth0'
}
