import formAutoContent from 'form-auto-content'
import { createReadStream } from 'fs'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'

import { projectProfileImageRoute } from '@rfcx-bio/common/api-bio/project/project-image'
import { buildVariantPath } from '@rfcx-bio/node-common/api-bio/_helpers'
import { type Project } from '@rfcx-bio/node-common/dao/types'
import { getMetadata } from '@rfcx-bio/node-common/image'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { PROJECT_IMAGE_CONFIG } from '@/projects/project-image-bll'
import { PATCH } from '~/api-helpers/types'
import { getS3Client } from '~/storage'
import { routesProject } from './index'

vi.mock('~/api-core/api-core')

const { LocationProject, LocationProjectProfile } = modelRepositoryWithElevatedPermissions

const storageClient = getS3Client()

const defaultProject: Project = {
  id: 50010,
  idArbimon: 5010,
  idCore: 's1O7h5',
  name: 'Sloths hanging from branches',
  slug: 'sloths-hanging',
  status: 'published',
  statusUpdatedAt: new Date(),
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeEast: 0,
  longitudeWest: 0
}
const localImageUrl = '../website/src/_assets/default-species-image.jpg'
const localNonImageUrl = './package.json'

beforeAll(async () => {
  await LocationProject.create(defaultProject)
})

afterEach(async () => {
  await LocationProjectProfile.destroy({ where: { locationProjectId: defaultProject.id } })
})

afterAll(async () => {
  await LocationProject.destroy({ where: { id: defaultProject.id }, force: true })
})

describe(`PATCH ${projectProfileImageRoute}`, async () => {
  test('updates the profile image / uploads file to storage', async () => {
    // Arrange
    const existingImage = 'xyz.jpg'
    await LocationProjectProfile.create({ locationProjectId: defaultProject.id, image: existingImage, summary: '', readme: '', methods: '', keyResult: '', resources: '', objectives: [], dateStart: null, dateEnd: null })
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    const url = projectProfileImageRoute.replace(':projectId', defaultProject.id.toString())
    const form = formAutoContent({
      file: createReadStream(localImageUrl)
    })

    // Act
    const response = await app.inject({ method: PATCH, url, ...form })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await LocationProjectProfile.findOne({ where: { locationProjectId: defaultProject.id } })
    expect(profile?.image).not.toBe(existingImage)
    const file = await storageClient.getObject(profile?.image ?? '') as Buffer
    expect(file.byteLength).toBeGreaterThan(1000)
  })

  test('creates new profile and sets image', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    const url = projectProfileImageRoute.replace(':projectId', defaultProject.id.toString())
    const form = formAutoContent({
      file: createReadStream(localImageUrl)
    })

    // Act
    const response = await app.inject({ method: PATCH, url, ...form })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await LocationProjectProfile.findOne({ where: { locationProjectId: defaultProject.id } })
    expect(profile).toBeDefined()
    expect(profile?.image).toBeDefined()
  })

  test('rejects non image', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    const url = projectProfileImageRoute.replace(':projectId', defaultProject.id.toString())
    const form = formAutoContent({
      file: createReadStream(localNonImageUrl)
    })

    // Act
    const response = await app.inject({ method: PATCH, url, ...form })

    // Assert
    expect(response.statusCode).toBe(415)
    const profile = await LocationProjectProfile.findOne({ where: { locationProjectId: defaultProject.id } })
    expect(profile).toBeNull()
  })

  test('rejects call from non admin user', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'user' })
    const url = projectProfileImageRoute.replace(':projectId', defaultProject.id.toString())
    const form = formAutoContent({
      file: createReadStream(localImageUrl)
    })

    // Act
    const response = await app.inject({ method: PATCH, url, ...form })

    // Assert
    expect(response.statusCode).toBe(403)
  })

  test('generates and saves a thumbnail image', async () => {
    // Arrange
    const existingImage = 'xyz.jpg'
    await LocationProjectProfile.create({ locationProjectId: defaultProject.id, image: existingImage, summary: '', readme: '', methods: '', keyResult: '', resources: '', objectives: [], dateStart: null, dateEnd: null })
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    const url = projectProfileImageRoute.replace(':projectId', defaultProject.id.toString())
    const form = formAutoContent({
      file: createReadStream(localImageUrl)
    })

    // Act
    const response = await app.inject({ method: PATCH, url, ...form })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await LocationProjectProfile.findOne({ where: { locationProjectId: defaultProject.id } })
    const originalImage = profile?.image ?? ''
    const thumbnailImage = buildVariantPath(originalImage, 'thumbnail')
    const file = await storageClient.getObject(thumbnailImage)
    expect(file).toBeDefined()
  })

  test('thumbnail image has correct dimensions', async () => {
    // Arrange
    const existingImage = 'xyz.jpg'
    await LocationProjectProfile.create({ locationProjectId: defaultProject.id, image: existingImage, summary: '', readme: '', methods: '', keyResult: '', resources: '', objectives: [], dateStart: null, dateEnd: null })
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    const url = projectProfileImageRoute.replace(':projectId', defaultProject.id.toString())
    const form = formAutoContent({
      file: createReadStream(localImageUrl)
    })

    // Act
    const response = await app.inject({ method: PATCH, url, ...form })

    // Assert
    expect(response.statusCode).toBe(204)
    const profile = await LocationProjectProfile.findOne({ where: { locationProjectId: defaultProject.id } })
    const originalImage = profile?.image ?? ''
    const thumbnailImage = buildVariantPath(originalImage, 'thumbnail')
    const file = await storageClient.getObject(thumbnailImage) as Buffer
    const imageMetadata = await getMetadata(file)
    const config = PROJECT_IMAGE_CONFIG.thumbnail
    expect(imageMetadata?.width).toEqual(config.width)
    expect(imageMetadata?.height).toEqual(config.height)
  })
})
