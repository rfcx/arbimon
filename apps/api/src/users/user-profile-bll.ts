import { type MultipartFile } from '@fastify/multipart'
import axios from 'axios'
import { createHash, randomBytes } from 'node:crypto'
import { extname } from 'node:path'
import { URL } from 'node:url'

import { type CoreUser } from '@rfcx-bio/common/api-core/project/users'
import { type OrganizationTypes, type UserProfile } from '@rfcx-bio/common/dao/types'

import { patchUserProfileOnCore } from '~/api-core/api-core'
import { BioNotFoundError } from '~/errors'
import { getObject, putObject } from '~/storage'
import { getProfileImageURL } from './helpers'
import { get, getAllOrganizations as daoGetAllOrganizations, update } from './user-profile-dao'

export const getUserProfile = async (email: string): Promise<Omit<UserProfile, 'id' | 'idAuth0'>> => {
  const profile = await get(email)

  if (profile === undefined) {
    throw BioNotFoundError()
  }

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    image: getProfileImageURL(profile.image),
    organizationIdAffiliated: profile.organizationIdAffiliated
  }
}

export const patchUserProfile = async (token: string, email: string, data: Partial<Omit<UserProfile, 'id' | 'idAuth0' | 'image' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const originalProfile = await getUserProfile(email)
  const newProfile = { ...originalProfile, ...data }

  const coreProfile: Pick<CoreUser, 'firstname' | 'lastname' | 'picture'> = {
    firstname: newProfile.firstName,
    lastname: newProfile.lastName,
    picture: getProfileImageURL(newProfile.image) ?? null
  }
  await patchUserProfileOnCore(token, email, coreProfile)
  await update(email, newProfile)
}

export const getUserProfileImage = async (email: string): Promise<ArrayBuffer> => {
  const userProfile = await get(email)
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
    return await getObject(userProfile.image)
  }
}

export const patchUserProfileImage = async (token: string, email: string, file: MultipartFile): Promise<void> => {
  const originalProfile = await getUserProfile(email)

  // hash the email to sha256 and use that as the folder name for storing the profile-image
  const hash = createHash('sha256')
  hash.update(email)
  const hexEmail = hash.digest('hex')

  const imagePath = `users/${hexEmail}/profile-image-${randomBytes(4).toString('hex')}${extname(file.filename)}`
  const newProfile = { ...originalProfile, image: imagePath }

  const coreProfile = {
    firstname: newProfile.firstName,
    lastname: newProfile.lastName,
    picture: getProfileImageURL(newProfile.image) ?? null
  }
  await patchUserProfileOnCore(token, email, coreProfile)
  await putObject(imagePath, await file.toBuffer(), file.mimetype, true)
  await update(email, newProfile)
}

// TODO: Move to new organizations-bll.ts
export const getAllOrganizations = async (): Promise<Array<OrganizationTypes['light']>> => {
  const organizations = await daoGetAllOrganizations()
  if (organizations === undefined) {
    throw BioNotFoundError()
  }
  return organizations
}
