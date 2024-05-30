import { type ImageVariant } from '@rfcx-bio/node-common/api-bio/_helpers'

import { getS3Client } from '~/storage'

const storageClient = getS3Client()

export const fileUrl = (pathOrUrl: string | undefined, variant?: ImageVariant): string | undefined => {
  if (pathOrUrl === undefined || pathOrUrl === null || pathOrUrl.length === 0) {
    return undefined
  }

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('static://')) {
    return pathOrUrl
  }

  // Assume it's a storage path
  return storageClient.getObjectPublicUrl(pathOrUrl, variant)
}
