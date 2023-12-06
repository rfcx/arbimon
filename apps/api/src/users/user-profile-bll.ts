import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { type MultipartFile } from '@fastify/multipart'
import { extname } from 'node:path'
import { type Readable } from 'node:stream'

import { type UserProfileResponse } from '@rfcx-bio/common/api-bio/users/profile'
import { type OrganizationTypes, type UserProfile } from '@rfcx-bio/common/dao/types'

import { BioNotFoundError, BioPublicError } from '~/errors'
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

  if (
    env.AWS_S3_BUCKET_REGION === undefined || env.AWS_S3_BUCKET_REGION === '' ||
    env.AWS_S3_ENDPOINT === undefined || env.AWS_S3_ENDPOINT === '' ||
    env.AWS_S3_ACCESS_KEY_ID === undefined || env.AWS_S3_ACCESS_KEY_ID === '' ||
    env.AWS_S3_SECRET_ACCESS_KEY === undefined || env.AWS_S3_SECRET_ACCESS_KEY === ''
  ) {
    throw new BioPublicError('AWS S3 bucket region is not defined', 500)
  }

  // TODO: fix default bucket
  const s3 = new S3Client({
    region: env.AWS_S3_BUCKET_REGION,
    endpoint: env.AWS_S3_ENDPOINT,
    credentials: {
      accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY
    }
  })

  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET_REGION,
    Key: userProfile.image
  })

  const response = await s3.send(command)
  const stream = response.Body as Readable

  return await new Promise<ArrayBuffer>((resolve, reject) => {
    const chunks: Buffer[] = []

    stream.on('data', chunk => chunks.push(chunk))
    stream.once('error', () => { reject(new BioPublicError('Cannot parse image from AWS S3 into file correctly', 500)) })
    stream.once('end', () => { resolve(Buffer.concat(chunks)) })
  })
}

export const patchUserProfileImage = async (userId: string, file: MultipartFile): Promise<void> => {
  if (
    env.AWS_S3_BUCKET_NAME === undefined || env.AWS_S3_BUCKET_NAME === '' ||
    env.AWS_S3_BUCKET_REGION === undefined || env.AWS_S3_BUCKET_REGION === '' ||
    env.AWS_S3_ENDPOINT === undefined || env.AWS_S3_ENDPOINT === '' ||
    env.AWS_S3_ACCESS_KEY_ID === undefined || env.AWS_S3_ACCESS_KEY_ID === '' ||
    env.AWS_S3_SECRET_ACCESS_KEY === undefined || env.AWS_S3_SECRET_ACCESS_KEY === ''
  ) {
    throw new BioPublicError('AWS S3 bucket region is not defined', 500)
  }

  const s3 = new S3Client({
    region: env.AWS_S3_BUCKET_REGION,
    endpoint: env.AWS_S3_ENDPOINT,
    credentials: {
      accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY
    }
  })

  const imagePath = `${env.AWS_S3_BUCKET_NAME}/${userId}/profile-image${extname(file.filename)}`
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: imagePath,
    Body: await file.toBuffer(),
    ContentType: file.mimetype
  })

  await s3.send(command)
  await daoPatchUserProfileImage(userId, env.AWS_S3_ENDPOINT == null || env.AWS_S3_ENDPOINT === '' ? `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_S3_BUCKET_REGION}.amazonaws.com/${imagePath}` : `${env.AWS_S3_ENDPOINT}/${imagePath}`)
}

export const getAllOrganizations = async (): Promise<Array<OrganizationTypes['light']>> => {
  const organizations = await daoGetAllOrganizations()
  if (organizations === undefined) {
    throw BioNotFoundError()
  }
  return organizations
}
