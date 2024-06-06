import { type MultipartFile } from '@fastify/multipart'
import { randomBytes } from 'crypto'
import { extname } from 'node:path'

import { resizeImage } from '@rfcx-bio/node-common/image'

import { getS3Client } from '~/storage'
import { createProjectProfile, getProjectProfile, updateProjectProfile } from './dao/project-profile-dao'

export const PROJECT_IMAGE_CONFIG = {
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

const storageClient = getS3Client()

export const patchProjectProfileImage = async (locationProjectId: number, file: MultipartFile): Promise<void> => {
  const { thumbnail: thumbnailConfig, original: originalConfig } = PROJECT_IMAGE_CONFIG
  const fileId = randomBytes(4).toString('hex')
  const originalPath = `projects/${locationProjectId}/project-profile-image-${fileId}${extname(file.filename)}`
  const original = await file.toBuffer()
  await storageClient.putObject(originalPath, original, { ContentType: file.mimetype, ACL: 'public-read', CacheControl: originalConfig.cacheControl })

  // generate thumbnail
  const thumbnailPath = `projects/${locationProjectId}/project-profile-image-${fileId}.thumbnail${extname(file.filename)}`
  const thumbnail = await resizeImage(original, thumbnailConfig)
  // save to S3
  await storageClient.putObject(thumbnailPath, thumbnail, { ContentType: file.mimetype, ACL: 'public-read', CacheControl: thumbnailConfig.cacheControl })

  if (await getProjectProfile(locationProjectId) === undefined) {
    await createProjectProfile({ locationProjectId, image: originalPath })
  } else {
    await updateProjectProfile({ locationProjectId, image: originalPath })
  }
}
