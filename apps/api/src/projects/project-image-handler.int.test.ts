import formAutoContent from 'form-auto-content'
import { createReadStream } from 'fs'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'

import { projectProfileImageRoute } from '@rfcx-bio/common/api-bio/project/project-image'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { PATCH } from '~/api-helpers/types'
import { getObject } from '~/storage'
import { routesProject } from './index'

vi.mock('~/api-core/api-core')

const { LocationProject, LocationProjectProfile } = modelRepositoryWithElevatedPermissions

const defaultProject = {
  id: 50010,
  idArbimon: 5010,
  idCore: 's1O7h5',
  name: 'Sloths hanging from branches',
  slug: 'sloths-hanging',
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
  await LocationProject.destroy({ where: { id: defaultProject.id } })
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
    const fileAsArrayBuffer = await getObject(profile?.image ?? '')
    expect(fileAsArrayBuffer.byteLength).toBeGreaterThan(1000)
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
})