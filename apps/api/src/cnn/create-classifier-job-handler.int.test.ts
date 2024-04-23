import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import { routesCnn } from './index'

const { LocationProject } = modelRepositoryWithElevatedPermissions

beforeEach(async () => {
  const project = makeProject(64859, 'Pandas of China', 'listed')
  await LocationProject.create(project)
})

afterEach(async () => {
  await LocationProject.destroy({ where: { id: 64859 }, force: true })
})

vi.mock('../_services/api-core/api-core')

describe('POST /jobs', async () => {
  test('successful call', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/jobs',
      payload: {
        classifierId: 3,
        projectId: 64859,
        queryStreams: 'Viper*',
        queryStart: '2024-01-01',
        queryEnd: '2024-01-31',
        queryHours: '8-10',
        minutesTotal: 1288
      }
    })

    // Assert
    expect(response.statusCode).toEqual(201)
    expect(response.headers.location).toEqual('/p/pandas-of-china/analyse/cnn/detail/121')
  })

  test('unknown projectId', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/jobs',
      payload: {
        classifierId: 3,
        projectId: 830485842,
        queryStreams: 'Viper*',
        queryStart: '2024-01-01',
        queryEnd: '2024-01-31',
        queryHours: '8-10',
        minutesTotal: 1288
      }
    })

    // Assert
    expect(response.statusCode).toEqual(404)
  })

  test('invalid date format', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/jobs',
      payload: {
        classifierId: 3,
        projectId: 830485842,
        queryStreams: 'Viper*',
        queryStart: 'what',
        queryEnd: '2024-01-31',
        queryHours: '8-10',
        minutesTotal: 1288
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
  })

  test('end date is before start date', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/jobs',
      payload: {
        classifierId: 3,
        projectId: 830485842,
        queryStreams: 'Viper*',
        queryStart: '2024-02-01',
        queryEnd: '2024-01-01',
        queryHours: '8-10',
        minutesTotal: 1288
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
  })

  test('invalid query hours will error', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/jobs',
      payload: {
        classifierId: 3,
        projectId: 830485842,
        queryStreams: 'Viper*',
        queryStart: '2024-02-01',
        queryEnd: '2024-01-01',
        queryHours: 'what',
        minutesTotal: 1288
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
  })

  test('non rfcx email cannot use the service', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'charleslecleeeere223@mclaren.com'
      }
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/jobs',
      payload: {
        classifierId: 3,
        projectId: 64859,
        queryStreams: 'Viper*',
        queryStart: '2024-01-01',
        queryEnd: '2024-01-31',
        queryHours: '8-10',
        minutesTotal: 1288
      }
    })

    // Assert
    expect(response.statusCode).toEqual(403)
  })
})
