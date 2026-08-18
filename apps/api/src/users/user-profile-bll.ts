import { type MultipartFile } from '@fastify/multipart'
import axios from 'axios'
import { createHash, randomBytes } from 'node:crypto'
import { extname } from 'node:path'
import { URL } from 'node:url'

import { type CoreUser } from '@rfcx-bio/common/api-core/project/users'
import { type OrganizationTypes, type UserProfile, type UserTimestampFormat, type UserTypes, MAX_USER_TIMESTAMP_FORMATS } from '@rfcx-bio/node-common/dao/types'
import { resizeImage } from '@rfcx-bio/node-common/image'

import { patchUserProfileOnCore } from '~/api-core/api-core'
import { type Auth0UserToken } from '~/auth0/types'
import { BioInvalidBodyError, BioNotFoundError } from '~/errors'
import { RESIZE_WIDTH_AVATAR, resizedFileUrl } from '~/format-helpers/file-url'
import { getS3Client } from '~/storage'
import { create, get, getAllOrganizations as daoGetAllOrganizations, getIdByEmail, query, update } from './user-profile-dao'

export const USER_CONFIG = {
  image: {
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
}

const storageClient = getS3Client()

export const getUsers = async (emailLike: string): Promise<Array<UserTypes['light']>> =>
  await query({ emailLike })

export const getUserProfile = async (id: number): Promise<Omit<UserProfile, 'id' | 'idAuth0'>> => {
  const profile = await get(id)

  if (profile === undefined) {
    throw BioNotFoundError()
  }

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    // Own-profile avatar; resized on demand (account settings renders small).
    // External (Gravatar-style) URLs pass through untouched.
    image: resizedFileUrl(profile.image, RESIZE_WIDTH_AVATAR),
    organizationIdAffiliated: profile.organizationIdAffiliated,
    accountTier: profile.accountTier,
    accountTierUpdatedAt: profile.accountTierUpdatedAt,
    additionalPremiumProjectSlots: profile.additionalPremiumProjectSlots,
    // MUST be returned here even though only the uploader reads it:
    // patchUserProfile builds its update by spreading this object, so any
    // field omitted from it is silently ERASED on every unrelated profile
    // save (e.g. changing your last name would drop your saved formats).
    timestampFormats: profile.timestampFormats ?? []
  }
}

/**
 * Validate a saved-formats list before it reaches the database.
 *
 * The client validates as the user types, but the API cannot trust that: this
 * is the only place that guarantees what lands in the column. Rejecting here
 * also keeps a bad format from being silently applied to every future upload
 * session, which is far harder to diagnose than a 400.
 */
/**
 * The `%`-token vocabulary a saved format may use.
 *
 * DELIBERATE DUPLICATE of `FORMAT_TOKENS` in
 * `packages/upload-engine/src/timestamp-parser.ts`. That package is
 * dependency-free by design (it is intended to back a desktop rebuild) and its
 * barrel re-exports browser-only modules — IndexedDB, Worker-backed FLAC — so
 * it cannot be imported into a Node process. Keeping a small literal list here
 * is preferable to either dragging browser globals into the API or adding a
 * shared package for twenty strings.
 *
 * If a token is ever added to the engine, add it here too; the int test
 * `rejects a format the engine would reject` guards the behaviour.
 */
const TIMESTAMP_FORMAT_TOKENS = new Set([
  '%Y', '%y', '%M', '%m', '%N', '%n', '%D', '%d', '%H', '%h',
  '%G', '%g', '%A', '%a', '%I', '%i', '%S', '%s', '%Z', '%z'
])

/**
 * Mirrors `validateTimestampFormat` in the upload engine: at least one known
 * token, no unknown tokens, no duplicates (a repeated token cannot be compiled
 * — it yields a duplicate named capture group). `%%` is an escaped literal
 * percent and is not a token.
 */
const isValidFormatString = (format: string): boolean => {
  const tokens = (format.match(/%%|%./g) ?? []).filter(token => token !== '%%')
  if (tokens.length === 0) return false
  if (tokens.some(token => !TIMESTAMP_FORMAT_TOKENS.has(token))) return false
  return new Set(tokens).size === tokens.length
}

const assertValidTimestampFormats = (formats: UserTimestampFormat[]): void => {
  if (!Array.isArray(formats)) {
    throw BioInvalidBodyError({ timestampFormats: 'must be an array' })
  }
  if (formats.length > MAX_USER_TIMESTAMP_FORMATS) {
    throw BioInvalidBodyError({ timestampFormats: `at most ${MAX_USER_TIMESTAMP_FORMATS} formats` })
  }

  const seenIds = new Set<string>()
  for (const entry of formats) {
    const { id, label, format } = entry ?? {}
    if (typeof id !== 'string' || id === '') {
      throw BioInvalidBodyError({ timestampFormats: 'each format needs an id' })
    }
    if (seenIds.has(id)) {
      throw BioInvalidBodyError({ timestampFormats: `duplicate id ${id}` })
    }
    seenIds.add(id)

    if (typeof label !== 'string' || label.trim() === '') {
      throw BioInvalidBodyError({ timestampFormats: 'each format needs a label' })
    }
    if (typeof format !== 'string' || !isValidFormatString(format)) {
      throw BioInvalidBodyError({ timestampFormats: `invalid format string: ${String(format)}` })
    }
  }
}

export const patchUserProfile = async (token: string, authToken: Auth0UserToken, id: number, data: Partial<Omit<UserProfile, 'id' | 'idAuth0' | 'image' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const { email, idAuth0 } = authToken
  const originalProfile = await getUserProfile(id)
  const newProfile = { ...originalProfile, ...data }

  // Only validate when the caller actually supplied the field; an unrelated
  // patch (name, organisation) must not be able to fail on pre-existing data.
  if (data.timestampFormats !== undefined) {
    assertValidTimestampFormats(data.timestampFormats)
  }

  const coreProfile: Pick<CoreUser, 'firstname' | 'lastname' | 'picture'> = {
    firstname: newProfile.firstName,
    lastname: newProfile.lastName,
    // Persisted to Core as this user's avatar URL; consumers render it small,
    // so store the resized form (NOTE: persisted URLs outlive config — if the
    // endpoint base ever moves, existing Core pictures keep the old host, the
    // same trade-off as the s3.arbimon.org URLs stored before this change).
    picture: resizedFileUrl(newProfile.image, RESIZE_WIDTH_AVATAR) ?? null
  }

  if (isAuth0(idAuth0)) {
    await patchUserProfileOnCore(token, email, coreProfile)
  }
  await update(email, newProfile)
}

export const getUserProfileImage = async (id: number): Promise<Buffer> => {
  const userProfile = await get(id)
  if (userProfile === undefined || userProfile.image === undefined) {
    throw BioNotFoundError()
  }

  // Parse the image to url constructor to test if it's a s3 path or a url
  try {
    const imageUrl = new URL(userProfile.image)
    const response = await axios.request({
      method: 'GET',
      url: imageUrl.toString(),
      responseType: 'arraybuffer'
    })

    const imageBuffer = Buffer.from(response.data, 'binary')
    return imageBuffer
  } catch (e) {
    // parse failed because it's an s3 image path
    return await storageClient.getObject(userProfile.image) as Buffer
  }
}

export const patchUserProfileImage = async (token: string, email: string, id: number, file: MultipartFile): Promise<void> => {
  const originalProfile = await getUserProfile(id)

  // hash the email to sha256 and use that as the folder name for storing the profile-image
  const hash = createHash('sha256')
  hash.update(email)
  const hexEmail = hash.digest('hex')

  const uniqueId = randomBytes(4).toString('hex')
  const image = await file.toBuffer()
  const { thumbnail: thumbnailConfig, original: originalConfig } = USER_CONFIG.image
  const imagePath = `users/${hexEmail}/profile-image-${uniqueId}${extname(file.filename)}`
  const thumbnailPath = `users/${hexEmail}/profile-image-${uniqueId}.thumbnail${extname(file.filename)}`
  const thumbnail = await resizeImage(image, thumbnailConfig)
  const newProfile = { ...originalProfile, image: imagePath }

  const coreProfile = {
    firstname: newProfile.firstName,
    lastname: newProfile.lastName,
    picture: resizedFileUrl(newProfile.image, RESIZE_WIDTH_AVATAR) ?? null
  }
  await patchUserProfileOnCore(token, email, coreProfile)
  await storageClient.putObject(imagePath, image, { ContentType: file.mimetype, ACL: 'public-read', CacheControl: originalConfig.cacheControl })
  await storageClient.putObject(thumbnailPath, thumbnail, { ContentType: file.mimetype, ACL: 'public-read', CacheControl: thumbnailConfig.cacheControl })
  await update(email, newProfile)
}

export const findOrCreateUserId = async (email: string, userInfo: Omit<UserProfile, 'id' | 'email'>): Promise<number> => {
  return await getIdByEmail(email).then(async (id) => id ?? await create({ email, ...userInfo }))
}

// TODO: Move to new organizations-bll.ts
export const getAllOrganizations = async (): Promise<Array<OrganizationTypes['light']>> => {
  const organizations = await daoGetAllOrganizations()
  if (organizations === undefined) {
    throw BioNotFoundError()
  }
  return organizations
}

const isAuth0 = (id: string): boolean => {
  const prefix = id.split('|')[0]
  return prefix === 'auth0'
}
