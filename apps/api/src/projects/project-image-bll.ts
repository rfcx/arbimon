import { type MultipartFile } from '@fastify/multipart'
import { randomBytes } from 'crypto'
import { extname } from 'node:path'

import { resizeImage } from '~/image'
import { putObject } from '~/storage'
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

export const patchProjectProfileImage = async (locationProjectId: number, file: MultipartFile): Promise<void> => {
  const { thumbnail: thumbnailConfig, original: originalConfig } = PROJECT_IMAGE_CONFIG
  const fileId = randomBytes(4).toString('hex')
  const originalPath = `projects/${locationProjectId}/project-profile-image-${fileId}${extname(file.filename)}`
  const original = await file.toBuffer()
  await putObject(originalPath, original, file.mimetype, true, { CacheControl: originalConfig.cacheControl })

  // generate thumbnail
  const thumbnailPath = `projects/${locationProjectId}/project-profile-image-${fileId}.thumbnail${extname(file.filename)}`
  const thumbnail = await resizeImage(original, thumbnailConfig)
  // save to S3
  await putObject(thumbnailPath, thumbnail, file.mimetype, true, { CacheControl: thumbnailConfig.cacheControl })

  if (await getProjectProfile(locationProjectId) === undefined) {
    await createProjectProfile({ locationProjectId, image: originalPath })
  } else {
    await updateProjectProfile({ locationProjectId, image: originalPath })
  }
}
