import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'

import { projectDataRoute } from '@rfcx-bio/common/api-bio/project/project-settings'
import { type Project } from '@rfcx-bio/common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { PATCH } from '~/api-helpers/types'
import { updateProjectLegacy } from '~/api-legacy-arbimon'
import { routesProject } from './index'

vi.mock('~/api-legacy-arbimon')

const { LocationProject, LocationProjectProfile } = modelRepositoryWithElevatedPermissions

const url = (projectId: number): string => {
  return `/projects/${projectId}/profile`
}

const project: Project = {
  id: 99991122,
  idArbimon: 48850,
  idCore: 'kmf993nmslsd',
  name: 'Istanbul cats diversities',
  slug: 'istanbul-cats-diversities',
  status: 'published',
  statusUpdatedAt: new Date(),
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeEast: 0,
  longitudeWest: 0
}

beforeAll(async () => {
  await LocationProject.create(project)
  await LocationProjectProfile.create({
    locationProjectId: project.id,
    summary: '',
    image: '',
    readme: '',
    dateStart: null,
    dateEnd: null,
    keyResult: '',
    resources: '',
    methods: '',
    objectives: []
  })
})

afterEach(async () => {
  vi.resetAllMocks()
})

afterAll(async () => {
  await LocationProjectProfile.destroy({ where: { locationProjectId: project.id } })
  await LocationProject.destroy({ where: { id: project.id }, force: true })
})

describe(`PATCH ${projectDataRoute}/profile route`, async () => {
  test('updates successfully', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    const projectClone = { ...project, name: 'Tbilisi cats diversities', slug: 'tbilisi-cats-diversities' }

    // Act
    const response = await app.inject({
      method: PATCH,
      url: url(project.id),
      payload: {
        name: projectClone.name,
        slug: projectClone.slug,
        summary: 'tbilisi cat diversities between each color of the cats'
      }
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const projectInDatabase = await LocationProject.findOne({ where: { id: project.id } })
    const projectProfileInDatabase = await LocationProjectProfile.findOne({ where: { locationProjectId: project.id } })
    expect(projectInDatabase).toBeTruthy()
    expect(projectProfileInDatabase).toBeTruthy()
    expect(projectInDatabase?.get('name')).toBe('Tbilisi cats diversities')
    expect(projectInDatabase?.get('slug')).toBe('tbilisi-cats-diversities')
    expect(projectProfileInDatabase?.get('summary')).toBe('tbilisi cat diversities between each color of the cats')
    expect(updateProjectLegacy).toBeCalledTimes(1)
  })
})
