import { describe, expect, test, vi } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { routesCnn } from './index'

vi.mock('../_services/api-core/api-core')

const jobId = 22

describe('GET /jobs/:jobId', async () => {
  test('successfully get classifier job information', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}`
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toHaveProperty('classifierId', 108)
    expect(json).toHaveProperty('totalDistinctClassifications', 5)
    expect(json).toHaveProperty('projectId', 'kd953mgodif9')
    expect(json).toHaveProperty('queryStart', '2023-01-01')
    expect(json).toHaveProperty('queryEnd', '2023-03-31')
    expect(json).toHaveProperty('minutesTotal', 11948)
    expect(json).toHaveProperty('minutesCompleted', 12194)
    expect(json).toHaveProperty('status', 30)
    expect(json).toHaveProperty('validationStatus.unvalidated', 2)
    expect(json).toHaveProperty('validationStatus.notPresent', 12)
    expect(json).toHaveProperty('validationStatus.unknown', 2)
    expect(json).toHaveProperty('validationStatus.present', 2)
  })

  test('person with incorrect email cannot get information out from this API', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'wrongperson@gmail.com'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}`
    })

    // Assert
    expect(response.statusCode).toEqual(403)
  })

  test('the api returns all correct keys from the backend with correct status', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}`
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
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
    expect(json).toHaveProperty('validationStatus')
    expect(json).toHaveProperty('totalDistinctClassifications')
    expect(json.status).toEqual(30)
  })
})
