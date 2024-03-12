import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { projectDataRoute } from '@rfcx-bio/common/api-bio/project/project-settings'
import { type LocationProjectProfile, type Project } from '@rfcx-bio/common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET, PATCH } from '~/api-helpers/types'
import { updateProjectLegacy } from '../_services/api-legacy-arbimon'
import { routesProject } from './index'

dayjs.extend(utc)
dayjs.extend(customParseFormat)
dayjs.extend(timezone)

vi.mock('../_services/api-legacy-arbimon')

const { LocationProject, LocationProjectProfile: LocationProjectProfileModel } = modelRepositoryWithElevatedPermissions

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

const projectForGetRouteTest: Project = {
  id: 1938433,
  idArbimon: 94834,
  idCore: 'kdj99r4iexvi',
  name: 'Dimitrovgrad diversities',
  slug: 'dimitrovgrad-diversities',
  status: 'published',
  statusUpdatedAt: new Date(),
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeEast: 0,
  longitudeWest: 0
}

const profileForGetRouteTest: LocationProjectProfile = {
  locationProjectId: 1938433,
  dateStart: dayjs('2023-06-01').toDate(),
  dateEnd: dayjs('2023-09-30').toDate(),
  summary: 'summary value',
  readme: 'readme value',
  keyResult: 'keyResult value',
  resources: 'resources value',
  methods: 'methods value',
  objectives: ['bio-baseline'],
  image: ''
}

beforeEach(async () => {
  await LocationProject.create(projectForGetRouteTest)
  await LocationProjectProfileModel.create(profileForGetRouteTest)

  await LocationProject.create(project)
  await LocationProjectProfileModel.create({
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
  await LocationProjectProfileModel.destroy({ where: { locationProjectId: [project.id, projectForGetRouteTest.id] }, force: true })
  await LocationProject.destroy({ where: { id: [project.id, projectForGetRouteTest.id] }, force: true })
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
        summary: 'tbilisi cat diversities between each color of the cats',
        keyResult: 'tbilisi people should be proud'
      }
    })

    // Assert
    expect(response.statusCode).toBe(204)
    const projectInDatabase = await LocationProject.findOne({ where: { id: project.id } })
    const projectProfileInDatabase = await LocationProjectProfileModel.findOne({ where: { locationProjectId: project.id } })
    expect(projectInDatabase).toBeTruthy()
    expect(projectProfileInDatabase).toBeTruthy()
    expect(projectInDatabase?.get('name')).toBe('Tbilisi cats diversities')
    expect(projectInDatabase?.get('slug')).toBe('tbilisi-cats-diversities')
    expect(projectProfileInDatabase?.get('summary')).toBe('tbilisi cat diversities between each color of the cats')
    expect(projectProfileInDatabase?.get('keyResult')).toEqual('tbilisi people should be proud')
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

describe('GET /projects/:projectId/profile', async () => {
  test('gets profile successfully', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'admin' })

    // Act
    const response = await app.inject({
      method: GET,
      url: url(projectForGetRouteTest.id)
    })

    // Assert
    const json = response.json()
    expect(json.slug).toEqual(projectForGetRouteTest.slug)
    expect(json.name).toEqual(projectForGetRouteTest.name)
    expect(json.summary).toEqual(profileForGetRouteTest.summary)
    expect(json.objectives).toEqual(profileForGetRouteTest.objectives)
    expect(json.isPublished).toEqual(true)
    expect(json.isPublic).toEqual(true)
  })

  test('get with additional fields successfully', async () => {
    const app = await makeApp(routesProject, { projectRole: 'admin' })

    const response = await app.inject({
      method: GET,
      url: url(projectForGetRouteTest.id),
      query: {
        fields: 'summary,readme,keyResult,resources'
      }
    })

    const json = response.json()
    expect(json.summary).toEqual(profileForGetRouteTest.summary)
    expect(json.readme).toEqual(profileForGetRouteTest.readme)
    expect(json.keyResult).toEqual(profileForGetRouteTest.keyResult)
    expect(json.resources).toEqual(profileForGetRouteTest.resources)
  })
})
