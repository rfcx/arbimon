import { type ImageVariant } from '@rfcx-bio/node-common/api-bio/_helpers'

import { env } from '~/env'
import { getS3Client } from '~/storage'

const storageClient = getS3Client()

// Resize-on-demand endpoint (rfcx-local 2026-08-17, rfcx-api PR #668):
//   GET {IMAGE_RESIZE_BASE_URL}/<key>?w=<width>
// e.g. https://arbimon.org/media-api/images/arbimon-profile/projects/10/....png?w=144
//
// The base URL INCLUDES the media-api source-bucket alias (media-api holds a
// whitelist; `arbimon-profile` is the alias for this app's bucket). When the
// env is unset, everything below falls back to the pre-existing behaviour
// (original object URL / `.thumbnail.` sidecar), so a misconfigured deploy
// degrades to the old world instead of emitting dead links.
//
// WHY route thumbnails here instead of the sidecar: 52 of 462 fulls (11.3%)
// have NO sidecar and hard-404 (broken avatar). The endpoint renders on
// demand, so sidecar coverage stops mattering; it also serves WebP (~21%
// smaller than JPEG) and repairs the bucket's widespread wrong-Content-Type
// on read. See rfcx-local runbooks/media-api-image-resize-2026-08-17.md.
const imageResizeBaseUrl = env.IMAGE_RESIZE_BASE_URL

// Widths are snapped UP to the endpoint's 16px grid server-side; keep them
// on-grid here so the emitted URL is already the canonical cache key. All
// three are sizes the endpoint's in-pod verification matrix exercised against
// real bucket objects (144/304/608).
// 144 intentionally matches the legacy `.thumbnail.` sidecar size.
export const RESIZE_WIDTH_THUMBNAIL = 144
// Avatars render at 32-48px CSS (h-8/w-12 rounded-full); 144 covers 3x DPR
// and shares the cache key with the thumbnail contract.
export const RESIZE_WIDTH_AVATAR = RESIZE_WIDTH_THUMBNAIL
// Project cards (my-projects, directory list) render ~112px CSS; 304 covers
// 2x DPR with headroom.
export const RESIZE_WIDTH_CARD = 304
// Hero/banner renders (directory project-info w-full h-52) up to ~300px CSS;
// 608 covers 2x DPR. The endpoint never upscales, so small originals are
// returned at their native size.
export const RESIZE_WIDTH_HERO = 608

const isPassthroughUrl = (pathOrUrl: string): boolean =>
  pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('static://')

/**
 * Public URL for a resized copy of a bucket image, served by the media-api
 * resize endpoint. Pass-through URLs (`http(s)://`, `static://`) are returned
 * untouched — those are the static placeholders and Gravatar-style externals.
 * Falls back to the ORIGINAL object URL when the endpoint is not configured.
 *
 * @param width target bounding-box width in px (height defaults to width
 *              server-side). Use a multiple of 16 (the endpoint's grid).
 */
export const resizedFileUrl = (pathOrUrl: string | undefined, width: number): string | undefined => {
  if (pathOrUrl === undefined || pathOrUrl === null || pathOrUrl.length === 0) {
    return undefined
  }

  if (isPassthroughUrl(pathOrUrl)) {
    return pathOrUrl
  }

  if (imageResizeBaseUrl === undefined || imageResizeBaseUrl === '') {
    return storageClient.getObjectPublicUrl(pathOrUrl)
  }

  const base = imageResizeBaseUrl.endsWith('/') ? imageResizeBaseUrl.slice(0, -1) : imageResizeBaseUrl
  return `${base}/${pathOrUrl}?w=${width}`
}

export const fileUrl = (pathOrUrl: string | undefined, variant?: ImageVariant): string | undefined => {
  if (pathOrUrl === undefined || pathOrUrl === null || pathOrUrl.length === 0) {
    return undefined
  }

  if (isPassthroughUrl(pathOrUrl)) {
    return pathOrUrl
  }

  // The thumbnail variant is served by the resize endpoint when configured:
  // same 144px contract as the `.thumbnail.` sidecars it replaces, but works
  // for the 11.3% of images that never had a sidecar generated.
  if (variant === 'thumbnail' && imageResizeBaseUrl !== undefined && imageResizeBaseUrl !== '') {
    return resizedFileUrl(pathOrUrl, RESIZE_WIDTH_THUMBNAIL)
  }

  // Assume it's a storage path
  return storageClient.getObjectPublicUrl(pathOrUrl, variant)
}
