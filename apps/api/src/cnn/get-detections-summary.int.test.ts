import { describe, expect, test, vi } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { routesCnn } from './index'

vi.mock('../_services/api-core/api-core')

describe('GET /detections/summary', async () => {
  test('route is queryable, the return type is correct', async () => {
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
      url: '/detections/summary',
      query: {
        start: '2021-12-31T23:55:00.000+0700',
        end: '2022-01-01T01:00:00.000+0700',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierId: '27',
        classifierJobId: '25'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toHaveProperty('unvalidated', 30)
    expect(json).toHaveProperty('notPresent', 0)
    expect(json).toHaveProperty('unknown', 12)
    expect(json).toHaveProperty('present', 8)
  })

  test('empty string start/end can be caught', async () => {
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
      url: '/detections/summary',
      query: {
        start: '',
        end: '',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierId: '27',
        classifierJobId: '25'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
  })

  test('non-date string in start/end can be caught', async () => {
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
      url: '/detections/summary',
      query: {
        start: 'what',
        end: 'when',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierId: '27',
        classifierJobId: '25'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
  })

  test('non-rfcx users will get 403', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'zhouguanyu1217@zhou.com'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/detections/summary',
      query: {
        start: 'what',
        end: 'when',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierId: '27',
        classifierJobId: '25'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(403)
  })

  test('when end is greater than start, 400 is returned', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'apgujeong@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/detections/summary',
      query: {
        start: '2024-01-01T00:00:00.000Z',
        end: '2024-01-01T00:00:00.000+0700',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierId: '27',
        classifierJobId: '25'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
  })

  test('when classifierId is missing, 400 is returned', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'apgujeong@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/detections/summary',
      query: {
        start: '2024-01-01T00:00:00.000Z',
        end: '2024-01-02T00:00:00.000+0700',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierJobId: '25'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
  })

  test('when classifierJobId is missing, 400 is returned', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'apgujeong@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/detections/summary',
      query: {
        start: '2024-01-01T00:00:00.000Z',
        end: '2024-01-02T00:00:00.000+0700',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierId: '49'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
  })
})
