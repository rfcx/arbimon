import { describe, expect, test, vi } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { routesCnn } from './index'

vi.mock('../_services/api-core/api-core')

describe('POST /detections/review', async () => {
  test('update the data successfully, returns 200', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'notPresent',
        classifierId: 12,
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        jobId: 225,
        start: '2022-01-05T12:00:00.000+0000',
        siteIdCore: 'kd9583ig385o'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toHaveProperty('[0].id', 1221017)
    expect(json).toHaveProperty('[0].status', 'present')
  })

  test('returns 400 when the `start` is not valid date', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'notPresent',
        classifierId: 12,
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        jobId: 225,
        start: 'invalid date',
        siteIdCore: 'kd9583ig385o'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('start')
  })

  test('returns 400 when `start` is empty string', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'notPresent',
        classifierId: 12,
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        jobId: 225,
        start: '',
        siteIdCore: 'kd9583ig385o'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('start')
  })

  test('returns 400 when `start` key is missing from body', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'notPresent',
        classifierId: 12,
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        jobId: 225,
        siteIdCore: 'kd9583ig385o'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('start')
  })

  test('returns 400 when `status` is missing from body', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        classifierId: 12,
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        jobId: 225,
        start: '2022-01-05T12:00:00.000+0000',
        siteIdCore: 'kd9583ig385o'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('status')
  })

  test('returns 400 when `status` is empty string', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: '',
        classifierId: 12,
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        jobId: 225,
        start: '2022-01-05T12:00:00.000+0000',
        siteIdCore: 'kd9583ig385o'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('status')
  })

  test('returns 400 when `status` is not a valid arbimon review status', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'huh',
        classifierId: 12,
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        jobId: 225,
        start: '2022-01-05T12:00:00.000+0000',
        siteIdCore: 'kd9583ig385o'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('status')
  })

  test('returns 400 when `classificationValue` is missing', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'present',
        classifierId: 12,
        jobId: 225,
        start: '2022-01-05T12:00:00.000+0000',
        siteIdCore: 'kd9583ig385o'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('classificationValue')
  })

  test('returns 400 when `classificationValue` is empty string', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'present',
        classifierId: 12,
        classificationValue: '',
        jobId: 225,
        start: '2022-01-05T12:00:00.000+0000',
        siteIdCore: 'kd9583ig385o'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('classificationValue')
  })

  test('returns 400 when `jobId` is missing', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'present',
        classifierId: 12,
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        start: '2022-01-05T12:00:00.000+0000',
        siteIdCore: 'kd9583ig385o'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('jobId')
  })

  test('returns 400 when `jobId` is not a valid number', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'present',
        classifierId: 12,
        jobId: 'what',
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        start: '2022-01-05T12:00:00.000+0000',
        siteIdCore: 'kd9583ig385o'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('jobId')
  })

  test('returns 400 when `siteIdCore` is missing', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'present',
        classifierId: 12,
        jobId: 12,
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        start: '2022-01-05T12:00:00.000+0000'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('siteIdCore')
  })

  test('returns 400 when `siteIdCore` is empty string', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'present',
        classifierId: 12,
        jobId: 12,
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        start: '2022-01-05T12:00:00.000+0000',
        siteIdCore: ''
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('siteIdCore')
  })

  test('returns 400 when `classifierId` is missing', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'present',
        jobId: 12,
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        start: '2022-01-05T12:00:00.000+0000',
        siteIdCore: 'kdiibl848j51'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('classifierId')
  })

  test('returns 400 when `classifierId` is not a valid number', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user'
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/detections/review',
      payload: {
        status: 'present',
        jobId: 12,
        classifierId: 'how',
        classificationValue: 'scheluris_carolinensis_simple_call_2',
        start: '2022-01-05T12:00:00.000+0000',
        siteIdCore: 'kdiibl848j51'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json).toHaveProperty('message')
    expect(json.message).toContain('classifierId')
  })
})
