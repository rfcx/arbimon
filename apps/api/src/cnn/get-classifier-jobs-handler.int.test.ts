import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import { type Project } from '@rfcx-bio/node-common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'

import * as apiCore from '~/api-core/api-core'
import { routesCnn } from './index'

const { LocationProject } = modelRepositoryWithElevatedPermissions

const cnnProject: Project = {
  id: 1913045,
  idCore: 'kdibowmfkfpd',
  idArbimon: 1948554,
  name: 'Danang diversity CNN',
  slug: 'danang-diversity-cnn',
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeAvg: 0,
  longitudeEast: 0,
  longitudeWest: 0,
  latitudeAvg: 0,
  status: 'published',
  statusUpdatedAt: new Date()
}

vi.mock('../_services/api-core/api-core')

beforeAll(async () => {
  await LocationProject.create(cnnProject)
})

afterAll(async () => {
  await LocationProject.destroy({ where: { id: cnnProject.id }, force: true })
})

describe('GET /jobs', async () => {
  test('can be called successfully', async () => {
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    const response = await app.inject({
      method: 'GET',
      url: '/jobs',
      query: {
        project: cnnProject.idCore.toString(),
        createdBy: 'all'
      }
    })

    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(Array.isArray(json)).toEqual(true)
    expect(json).toHaveLength(1)
  })

  test('missing project id should result in bad request', async () => {
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    const response = await app.inject({
      method: 'GET',
      url: '/jobs',
      query: {
        project: '',
        createdBy: 'all'
      }
    })

    expect(response.statusCode).toEqual(400)
  })

  test('missing createdBy should result in the result returning back as normal, and the createdBy being \'undefined\'', async () => {
    const spy = vi.spyOn(apiCore, 'getClassifierJobs')

    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    const response = await app.inject({
      method: 'GET',
      url: '/jobs',
      query: {
        project: cnnProject.idCore.toString()
      }
    })

    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', { projects: [cnnProject.idCore.toString()], createdBy: 'all' })
    const json = response.json()
    expect(json).toHaveLength(1)
  })

  test('anyone who does not have rfcx.org email cannot get data from these routes', async () => {
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'someoutoutside@gmail.com'
      }
    })

    const response = await app.inject({
      method: 'GET',
      url: '/jobs',
      query: {
        project: cnnProject.idCore.toString(),
        createdBy: 'all'
      }
    })

    expect(response.statusCode).toEqual(403)
  })

  test.todo('the returned key values are all correct', async () => {
    const app = await makeApp(routesCnn, { projectRole: 'user' })

    const response = await app.inject({
      method: 'GET',
      url: '/jobs',
      query: {
        project: cnnProject.idCore.toString(),
        createdBy: 'all'
      }
    })

    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toHaveLength(1)
    expect(json.status).toEqual(30)
    expect(json).toHaveProperty('id')
    expect(json).toHaveProperty('classifierId')
    expect(json).toHaveProperty('projectId')
    expect(json).toHaveProperty('queryStreams')
    expect(json).toHaveProperty('queryStart')
    expect(json).toHaveProperty('queryEnd')
    expect(json).toHaveProperty('queryHours')
    expect(json).toHaveProperty('minutesTotal')
    expect(json).toHaveProperty('minutesCompleted')
    expect(json).toHaveProperty('status')
    expect(json).toHaveProperty('createdById')
    expect(json).toHaveProperty('createdAt')
    expect(json).toHaveProperty('completedAt')
    expect(json).toHaveProperty('classifier')
    expect(json).toHaveProperty('streams')
  })
})
