import { type MultipartFile } from '@fastify/multipart'
import { extname } from 'node:path'

import { type UserProfileResponse } from '@rfcx-bio/common/api-bio/users/profile'
import { type OrganizationTypes, type UserProfile } from '@rfcx-bio/common/dao/types'

import { BioNotFoundError, BioPublicError } from '~/errors'
import { getObject, putObject } from '~/storage'
import { env } from '../_services/env'
import { getAllOrganizations as daoGetAllOrganizations, getUserProfile as daoGetUserProfile, patchUserProfile as daoPatchUserProfile, patchUserProfileImage as daoPatchUserProfileImage } from './user-profile-dao'

export const getUserProfile = async (userId: string): Promise<UserProfileResponse> => {
  const profile = await daoGetUserProfile(userId)
  if (profile === undefined) {
    throw BioNotFoundError()
  }
  return profile
}

export const patchUserProfile = async (userId: string, data: Partial<Omit<UserProfile, 'id' | 'userIdAuth0' | 'image' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const originalProfile = await getUserProfile(userId)
  if (originalProfile === undefined) {
    throw BioNotFoundError()
  }

  // TODO: Call core API to change user's name.
  // It does not seems like we have core endpoints or arbimon endpoints public to edit these informations.
  await daoPatchUserProfile(userId, data)
}

export const getUserProfileImage = async (userId: string): Promise<ArrayBuffer> => {
  const userProfile = await daoGetUserProfile(userId)
  if (userProfile == null || userProfile.image == null) {
    throw BioNotFoundError()
  }

  return await getObject(userProfile.image)
}

export const patchUserProfileImage = async (userId: string, file: MultipartFile): Promise<void> => {
  const {
    AWS_S3_ENDPOINT: endpoint,
    AWS_S3_BUCKET_REGION: region,
    AWS_S3_BUCKET_NAME: bucketName,
    AWS_S3_ACCESS_KEY_ID: accessKeyId,
    AWS_S3_SECRET_ACCESS_KEY: secretAccessKey
  } = env

  if (
    bucketName === undefined || bucketName === '' ||
    region === undefined || region === '' ||
    accessKeyId === undefined || accessKeyId === '' ||
    secretAccessKey === undefined || secretAccessKey === ''
  ) {
    throw new BioPublicError('AWS S3 bucket credentials is not defined', 500)
  }

  const imagePath = `users/${userId}/profile-image${extname(file.filename)}`
  await putObject(`${bucketName}/${imagePath}`, await file.toBuffer(), file.mimetype)

  await daoPatchUserProfileImage(userId, endpoint == null || endpoint === '' ? `https://${bucketName}.s3.${region}.amazonaws.com/${imagePath}` : `${endpoint}/${bucketName}/${imagePath}`)
}

export const getAllOrganizations = async (): Promise<Array<OrganizationTypes['light']>> => {
  const organizations = await daoGetAllOrganizations()
  if (organizations === undefined) {
    throw BioNotFoundError()
  }
  return organizations
}
