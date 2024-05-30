import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { ERROR_MESSAGE_UPDATE_PROJECT_SLUG_NOT_UNIQUE, projectDataRoute } from '@rfcx-bio/common/api-bio/project/project-settings'
import { type LocationProjectProfile, type Project } from '@rfcx-bio/node-common/dao/types'
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
  const url = projectDataRoute.replace(':projectId', project.id.toString()) + '/profile'

  test('updates successfully', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    const payload = {
      name: 'Tbilisi Cats Diversities',
      slug: 'tbilisi-cats-diversities',
      summary: 'In the blistering heat summer, Tbilisi\'s dogs and cats are struggling to survive.',
      keyResult: 'Save the cats'
    }

    // Act
    const response = await app.inject({ method: PATCH, url, payload })

    // Assert
    expect(response.statusCode).toBe(204)
    const updatedProject = await LocationProject.findOne({ where: { id: project.id } })
    const updatedProjectProfile = await LocationProjectProfileModel.findOne({ where: { locationProjectId: project.id } })
    expect(updatedProject?.get('name')).toBe(payload.name)
    expect(updatedProject?.get('slug')).toBe(payload.slug)
    expect(updatedProjectProfile?.get('summary')).toBe(payload.summary)
    expect(updatedProjectProfile?.get('keyResult')).toEqual(payload.keyResult)
    expect(updateProjectLegacy).toBeCalledTimes(1)
  })

  test('invalid slug returns error', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    const payload = {
      slug: 'istanbul-cats-dogs-hamsters-and-rabbits-diversities' // Too long
    }

    // Act
    const response = await app.inject({ method: PATCH, url, payload })

    // Assert
    expect(response.statusCode).toBe(400)
  })

  test('duplicate slug returns error', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    ;(updateProjectLegacy as any).mockResolvedValueOnce({ success: false, error: 'URL a-duplicate-slug is invalid' })
    const payload = {
      slug: 'a-duplicate-slug' // Already exists in db
    }

    // Act
    const response = await app.inject({ method: PATCH, url, payload })

    expect(response.statusCode).toBe(400)
    const json = response.json<{ statusCode: number, error: string, message: string }>()
    expect(json.message).toBe(ERROR_MESSAGE_UPDATE_PROJECT_SLUG_NOT_UNIQUE)
  })

  test('cannot set hidden when published', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    const payload = {
      hidden: true
    }

    // Act
    const response = await app.inject({ method: PATCH, url, payload })

    // Assert
    expect(response.statusCode).toBe(400)
  })

  test('can set hidden when listed', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'admin' })
    await LocationProject.upsert({ ...project, status: 'listed' })
    const payload = {
      hidden: true
    }

    // Act
    const response = await app.inject({ method: PATCH, url, payload })

    // Assert
    expect(response.statusCode).toBe(204)
    const updatedProject = await LocationProject.findOne({ where: { id: project.id } })
    expect(updatedProject?.status).toBe('hidden')
  })
})

describe('GET /projects/:projectId/profile', async () => {
  const url = projectDataRoute.replace(':projectId', projectForGetRouteTest.id.toString()) + '/profile'

  test('gets profile successfully', async () => {
    // Arrange
    const app = await makeApp(routesProject, { projectRole: 'admin' })

    // Act
    const response = await app.inject({ method: GET, url })

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

    const response = await app.inject({ method: GET, url, query: { fields: 'summary,readme,keyResult,resources' } })

    const json = response.json()
    expect(json.summary).toEqual(profileForGetRouteTest.summary)
    expect(json.readme).toEqual(profileForGetRouteTest.readme)
    expect(json.keyResult).toEqual(profileForGetRouteTest.keyResult)
    expect(json.resources).toEqual(profileForGetRouteTest.resources)
  })
})
