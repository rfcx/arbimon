import formAutoContent from 'form-auto-content'
import { createReadStream } from 'fs'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { buildVariantPath } from '@rfcx-bio/node-common/api-bio/_helpers'
import { getMetadata } from '@rfcx-bio/node-common/image'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { USER_CONFIG } from '@/users/user-profile-bll'
import { PATCH } from '~/api-helpers/types'
import { getS3Client } from '~/storage'
import { routesUserProfile } from './index'

vi.mock('../_services/api-core/api-core', () => {
  return {
    patchUserProfileOnCore: vi.fn(async () => {
      await Promise.resolve()
    })
  }
})

const storageClient = getS3Client()

const ROUTE = '/profile-image'
const token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlF6UTROakpHTkRVd01UTTJSVGREUmpRMVFqazROa001UVVFMU1URTJSREl5T1VJME9VRkVOQSJ9.eyJhdXRoMF91c2VyX2lkIjoiYXV0aDB8NjVkYzlmMDlhNWVmYzE1Yjc4NTI1YTg0IiwiaHR0cHM6Ly9yZmN4Lm9yZy9hcHBfbWV0YWRhdGEiOnsiYXV0aG9yaXphdGlvbiI6eyJncm91cHMiOltdLCJyb2xlcyI6WyJhcHBVc2VyIl0sInBlcm1pc3Npb25zIjpbXX0sImd1aWQiOiIxNmRlYTk3Yy02MDVmLTQ4Y2QtYjU5MS01MjVjZmE1OWJmNTkiLCJsb2dpbnNOdW1iZXIiOjM3fSwidXNlcl9tZXRhZGF0YSI6eyJjb25zZW50R2l2ZW4iOiJ0cnVlIiwicmVjZWl2ZU5ld3MiOiJmYWxzZSIsImNvbnNlbnRHaXZlbkRhc2hib2FyZCI6InRydWUiLCJjb25zZW50R2l2ZW5BY291c3RpY3NFeHBsb3JlciI6InRydWUiLCJjb25zZW50R2l2ZW5SYW5nZXJBcHAiOiJ0cnVlIn0sImh0dHBzOi8vcmZjeC5vcmcvdXNlcl9tZXRhZGF0YSI6eyJjb25zZW50R2l2ZW4iOiJ0cnVlIiwicmVjZWl2ZU5ld3MiOiJmYWxzZSIsImNvbnNlbnRHaXZlbkRhc2hib2FyZCI6InRydWUiLCJjb25zZW50R2l2ZW5BY291c3RpY3NFeHBsb3JlciI6InRydWUiLCJjb25zZW50R2l2ZW5SYW5nZXJBcHAiOiJ0cnVlIn0sImd1aWQiOiIxNmRlYTk3Yy02MDVmLTQ4Y2QtYjU5MS01MjVjZmE1OWJmNTkiLCJsb2dpbnNOdW1iZXIiOjM3LCJnaXZlbl9uYW1lIjoiTHVjeSIsImZhbWlseV9uYW1lIjoiRGltaXRyb3ZhIiwibmlja25hbWUiOiJsdWN5IiwibmFtZSI6Ikx1Y3kgRGltaXRyb3ZhIiwicGljdHVyZSI6Imh0dHBzOi8vcy5ncmF2YXRhci5jb20vYXZhdGFyL2MxZDM4YzMyZmE3MGE5NWQ1NzhiNjY4NGJjMGQ0NDMwP3M9NDgwJnI9cGcmZD1odHRwcyUzQSUyRiUyRmNkbi5hdXRoMC5jb20lMkZhdmF0YXJzJTJGbGQucG5nIiwidXBkYXRlZF9hdCI6IjIwMjQtMDQtMDFUMTU6NTI6NTIuMjM2WiIsImVtYWlsIjoibHVjeUByZmN4Lm9yZyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2F1dGgucmZjeC5vcmcvIiwiYXVkIjoiTGlvamR2TlVzZXJHbkNhTGo4Y2tjeGVHUEhPS2l0T2MiLCJpYXQiOjE3MTE5ODY3NzQsImV4cCI6MTcxNDU3ODc3NCwic3ViIjoiYXV0aDB8NjVkYzlmMDlhNWVmYzE1Yjc4NTI1YTg0IiwiYXV0aF90aW1lIjoxNzExOTg2NzcyLCJzaWQiOiJ4MzNlRmpHZjM1OTRSM1h1ajQ4ZDdzeUx1VGdob3FlSyIsIm5vbmNlIjoiUnkxV2NUQTJVbDlIVWtnd1JuWnZhbEpCVlcxQllUZHFZelZQY2pORlJHWmFaakZqTTI1Sllua3paZz09In0.O2iT62WQuRi5x-Og3fI9IQbHsySojWbKnsjV4-FQfISls-dxkavpTNPm9SnBtNqkuW5lVJsAXVTEZkwjDucFMHwOYqKCcVLSDLqo319NMlXLac1SKsjR1uhDNGPTziDypxoCzMtVIOiENR1PUYu7leNPzg1uIB0LyMFDqVElUgKAzUW9cCE3fi6Ir9AknjJCbuL5UsWFSLjctKfiwo0-hnG6NEjPQZzrEpbePi5sn9O1vXljgBwYnkjXE9OF6GJpxw3zNmcYiTUqv-z0OdPBExLcNZ3uGWImSTD_KV3aT2w0VYINCotx5xHUynPDAeuOTffl6X5USQR14Olcyu2X5A'

const existingImage = 'xyz.png'
const localImageUrl = '../website/src/_assets/default-species-image.jpg'
const defaultUserToken = {
  email: 'lucy@rfcx.org',
  idAuth0: 'auth0|65dc9f09a5efc15b78525a84',
  firstName: 'Lucy',
  lastName: 'Dimitrova'
}

const defaultUserProfile = { id: 9006, image: existingImage, ...defaultUserToken }

const { UserProfile } = modelRepositoryWithElevatedPermissions

afterEach(async () => {
  const profile = await UserProfile.findOne({ where: { id: defaultUserProfile.id } })
  if (profile !== null) {
    await profile.update({ image: existingImage })
  }
})

describe('PATCH /profile-image', async () => {
  test('updates profile image', async () => {
    // Arrange
    const app = await makeApp(routesUserProfile, { userId: defaultUserProfile.id, userToken: defaultUserToken })
    const form = formAutoContent({
      file: createReadStream(localImageUrl)
    })
    form.headers.authorization = token

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      ...form
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await UserProfile.findOne({ where: { id: defaultUserProfile.id } })

    expect(profile?.image).not.toBe(existingImage)
    const file = await storageClient.getObject(profile?.image ?? '') as Buffer
    expect(file.byteLength).toBeGreaterThan(1000)
  })

  test('generates and saves a thumbnail image', async () => {
    // Arrange
    const app = await makeApp(routesUserProfile, { userId: defaultUserProfile.id, userToken: defaultUserToken })
    const form = formAutoContent({
      file: createReadStream(localImageUrl)
    })
    form.headers.authorization = token

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      ...form
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await UserProfile.findOne({ where: { email: defaultUserProfile.email } })
    const originalImage = profile?.image ?? ''
    const thumbnailImage = buildVariantPath(originalImage, 'thumbnail')
    const file = await storageClient.getObject(thumbnailImage) as Buffer
    expect(file).toBeDefined()
  })

  test('thumbnail image has correct dimensions', async () => {
    // Arrange
    const app = await makeApp(routesUserProfile, { userId: defaultUserProfile.id, userToken: defaultUserToken })
    const form = formAutoContent({
      file: createReadStream(localImageUrl)
    })
    form.headers.authorization = token

    // Act
    const response = await app.inject({
      method: PATCH,
      url: ROUTE,
      ...form
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await UserProfile.findOne({ where: { email: defaultUserProfile.email } })
    const originalImage = profile?.image ?? ''
    const thumbnailImage = buildVariantPath(originalImage, 'thumbnail')
    const file = await storageClient.getObject(thumbnailImage) as Buffer
    expect(file).toBeDefined()
    const imageMetadata = await getMetadata(file)
    const config = USER_CONFIG.image.thumbnail
    expect(imageMetadata?.width).toEqual(config.width)
    expect(imageMetadata?.height).toEqual(config.height)
  })
})
