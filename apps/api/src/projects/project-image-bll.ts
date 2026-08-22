import { type MultipartFile } from '@fastify/multipart'
import { randomBytes } from 'crypto'

import { getStoredImageFormat, resizeImageToFormat } from '@rfcx-bio/node-common/image'

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
  const original = await file.toBuffer()

  // Extension and Content-Type are derived from the BYTES. `file.filename` and
  // `file.mimetype` are untrusted client hints: the website's canvas downscale
  // historically transcoded JPEG->PNG while keeping the original filename,
  // which mislabelled ~42% of the bucket (and `.enc`/`.jfif` uploads kept
  // their junk extensions). See rfcx-local
  // runbooks/FINDING-profile-image-format-mislabelling-2026-08-17.md.
  const { format, extension, contentType } = await getStoredImageFormat(original)

  const originalPath = `projects/${locationProjectId}/project-profile-image-${fileId}${extension}`
  await storageClient.putObject(originalPath, original, { ContentType: contentType, ACL: 'public-read', CacheControl: originalConfig.cacheControl })

  // generate thumbnail - explicit output format, so the stored bytes always
  // match the label (sharp otherwise emits the INPUT's format)
  const thumbnailPath = `projects/${locationProjectId}/project-profile-image-${fileId}.thumbnail${extension}`
  const thumbnail = await resizeImageToFormat(original, thumbnailConfig, format)
  // save to S3
  await storageClient.putObject(thumbnailPath, thumbnail, { ContentType: contentType, ACL: 'public-read', CacheControl: thumbnailConfig.cacheControl })

  if (await getProjectProfile(locationProjectId) === undefined) {
    await createProjectProfile({ locationProjectId, image: originalPath })
  } else {
    await updateProjectProfile({ locationProjectId, image: originalPath })
  }
}
