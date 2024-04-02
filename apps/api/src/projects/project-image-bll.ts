import { type MultipartFile } from '@fastify/multipart'
import { randomBytes } from 'crypto'
import { extname } from 'node:path'

import { resizeImage } from '~/image'
import { putObject } from '~/storage'
import { createProjectProfile, getProjectProfile, updateProjectProfile } from './dao/project-profile-dao'

export const PROJECT_IMAGE_CONFIG = {
  thumbnail: {
    width: 72,
    height: 72,
    // 7 days
    cacheControl: 'max-age=604800, s-maxage=604800'
  }
}

export const patchProjectProfileImage = async (locationProjectId: number, file: MultipartFile): Promise<void> => {
  const fileId = randomBytes(4).toString('hex')
  const originalPath = `projects/${locationProjectId}/project-profile-image-${fileId}${extname(file.filename)}`
  const original = await file.toBuffer()
  await putObject(originalPath, original, file.mimetype, true)

  // generate thumbnail
  const config = PROJECT_IMAGE_CONFIG.thumbnail
  const thumbnailPath = `projects/${locationProjectId}/project-profile-image-${fileId}.thumbnail${extname(file.filename)}`
  const thumbnail = await resizeImage(original, config)
  // save to S3
  await putObject(thumbnailPath, thumbnail, file.mimetype, true, { CacheControl: config.cacheControl })

  if (await getProjectProfile(locationProjectId) === undefined) {
    await createProjectProfile({ locationProjectId, image: originalPath })
  } else {
    await updateProjectProfile({ locationProjectId, image: originalPath })
  }
}
