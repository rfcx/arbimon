import { getObjectPublicUrl } from '~/storage'

export const fileUrl = (pathOrUrl: string | undefined): string | undefined => {
  if (pathOrUrl === undefined || pathOrUrl.length === 0) {
    return undefined
  }

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('static://')) {
    return pathOrUrl
  }

  // Assume it's a storage path
  return getObjectPublicUrl(pathOrUrl)
}
