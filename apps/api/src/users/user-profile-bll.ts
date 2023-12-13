import { type MultipartFile } from '@fastify/multipart'
import { extname } from 'node:path'

import { type UserProfileResponse } from '@rfcx-bio/common/api-bio/users/profile'
import { type OrganizationTypes, type UserProfile } from '@rfcx-bio/common/dao/types'

import { BioNotFoundError } from '~/errors'
import { getObject, putObject } from '~/storage'
import { get, getAllOrganizations as daoGetAllOrganizations, update } from './user-profile-dao'

const defaultProfile = {
  firstName: '',
  lastName: ''
}

export const getUserProfile = async (userId: string): Promise<UserProfileResponse> => {
  const profile = await get(userId)

  // First time, create it
  if (profile === undefined) {
    // TODO: Call Core to get the profile
    return defaultProfile
  }

  return profile
}

export const patchUserProfile = async (userId: string, data: Partial<Omit<UserProfile, 'id' | 'userIdAuth0' | 'image' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const originalProfile = await getUserProfile(userId)
  const newProfile = { ...originalProfile, ...data }

  // TODO: Call Core to change user's name if needed
  await update(userId, newProfile)
}

export const getUserProfileImage = async (userId: string): Promise<ArrayBuffer> => {
  const userProfile = await get(userId)
  if (userProfile === undefined || userProfile.image === undefined) {
    throw BioNotFoundError()
  }

  return await getObject(userProfile.image)
}

export const patchUserProfileImage = async (userId: string, file: MultipartFile): Promise<void> => {
  const originalProfile = await getUserProfile(userId)
  const imagePath = `users/${userId}/profile-image${extname(file.filename)}`
  const newProfile = { ...originalProfile, image: imagePath }

  await putObject(imagePath, await file.toBuffer(), file.mimetype)

  await update(userId, newProfile)
}

// TODO: Move to new organizations-bll.ts
export const getAllOrganizations = async (): Promise<Array<OrganizationTypes['light']>> => {
  const organizations = await daoGetAllOrganizations()
  if (organizations === undefined) {
    throw BioNotFoundError()
  }
  return organizations
}
