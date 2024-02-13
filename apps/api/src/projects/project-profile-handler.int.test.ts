import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { projectDataRoute } from '@rfcx-bio/common/api-bio/project/project-settings'
import { type Project } from '@rfcx-bio/common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { PATCH } from '~/api-helpers/types'
import { updateProjectLegacy } from '../_services/api-legacy-arbimon'
import { routesProject } from './index'

vi.mock('../_services/api-legacy-arbimon')

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

beforeEach(async () => {
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

  test('a redundant slug on legacy is able to be caught', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    ;(updateProjectLegacy as any).mockResolvedValueOnce({ success: false, error: 'URL existing-slug is invalid' })

    // Act
    const response = await app.inject({
      method: PATCH,
      url: url(project.id),
      payload: {
        name: project.name,
        slug: 'existing-slug',
        summary: 'tbilisi cat diversities between each color of the cats'
      }
    })

    expect(response.statusCode).toBe(400)
    const json = response.json<{ statusCode: number, error: string, message: string }>()
    expect(json.message).toBe('URL existing-slug is redundant')
    const projectInDatabase = await LocationProject.findOne({ where: { id: project.id } })
    expect(projectInDatabase).toBeTruthy()
    expect(projectInDatabase?.name).toBe('Istanbul cats diversities')
    expect(projectInDatabase?.slug).toBe('istanbul-cats-diversities')
    expect(updateProjectLegacy).toBeCalledTimes(1)
  })
})
