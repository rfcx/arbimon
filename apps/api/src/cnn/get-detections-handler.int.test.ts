import { describe, expect, test, vi } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import * as core from '../_services/api-core/api-core'
import { routesCnn } from './index'

vi.mock('../_services/api-core/api-core')

describe('GET /detections', async () => {
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
      url: '/detections',
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
    expect(json).toHaveLength(4)
    expect(json).toHaveProperty('[0].reviewStatus', 'unvalidated')
    expect(json).toHaveProperty('[1].reviewStatus', 'notPresent')
    expect(json).toHaveProperty('[2].reviewStatus', 'unknown')
    expect(json).toHaveProperty('[3].reviewStatus', 'present')
    expect(json).toHaveProperty('[0].classification')
    expect(json[0].reviewStatus).toBeTypeOf('string')
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
      url: '/detections',
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

  test('start being null can be caught', async () => {
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
      url: '/detections',
      query: {
        start: 'null',
        end: 'null',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierId: '27',
        classifierJobId: '25'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
  })

  test('non-date string in start or end can be caught', async () => {
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
      url: '/detections',
      query: {
        start: 'this is not date bruh',
        end: 'this too',
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
        email: 'maxverstappen@redbullracing.com'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/detections',
      query: {
        start: '2021-12-31T23:55:00.000+0700',
        end: '2022-01-01T01:00:00.000+0700',
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
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/detections',
      query: {
        end: '2021-12-31T23:55:00.000+0700',
        start: '2022-01-01T01:00:00.000+0700',
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
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/detections',
      query: {
        start: '2021-12-31T23:55:00.000+0700',
        end: '2022-01-01T01:00:00.000+0700',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierJobId: '25'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json.message).toContain('classifierId')
  })

  test('when classifierJobId is missing, 400 is returned', async () => {
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
      url: '/detections',
      query: {
        start: '2021-12-31T23:55:00.000+0700',
        end: '2022-01-01T01:00:00.000+0700',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierId: '27'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(400)
    const json = response.json()
    expect(json.message).toContain('classifierJobId')
  })

  test('when only one site is given, the system can serialize it correctly', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getDetections')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/detections',
      query: {
        start: '2021-12-31T23:55:00.000+0700',
        end: '2022-01-01T01:00:00.000+0700',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierId: '27',
        classifierJobId: '25',
        'sites[]': ['kdibkrnfh84k']
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenCalledWith('', {
      start: '2021-12-31T23:55:00.000+0700',
      end: '2022-01-01T01:00:00.000+0700',
      streams: ['kdibkrnfh84k'],
      classifications: ['schlerlus_carolinensis_simple_call_1'],
      classifiers: [27],
      classifier_jobs: [25],
      min_confidence: undefined,
      review_statuses: undefined,
      limit: 100,
      offset: 0,
      descending: true,
      fields: [
        'id',
        'stream_id',
        'classifier_id',
        'start',
        'end',
        'confidence',
        'review_status',
        'classification'
      ]
    })
  })

  test('when multiple sites are given, the system can serialize it correctly', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getDetections')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/detections',
      query: {
        start: '2021-12-31T23:55:00.000+0700',
        end: '2022-01-01T01:00:00.000+0700',
        classification: 'schlerlus_carolinensis_simple_call_1',
        classifierId: '27',
        classifierJobId: '25',
        'sites[]': ['kdibkrnfh84k', 'iehmdkifu485']
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenCalledWith('', {
      start: '2021-12-31T23:55:00.000+0700',
      end: '2022-01-01T01:00:00.000+0700',
      streams: ['kdibkrnfh84k', 'iehmdkifu485'],
      classifications: ['schlerlus_carolinensis_simple_call_1'],
      classifiers: [27],
      classifier_jobs: [25],
      min_confidence: undefined,
      review_statuses: undefined,
      limit: 100,
      offset: 0,
      descending: true,
      fields: [
        'id',
        'stream_id',
        'classifier_id',
        'start',
        'end',
        'confidence',
        'review_status',
        'classification'
      ]
    })
  })

  test('classification value can be omitted when not given', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getDetections')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/detections',
      query: {
        start: '2021-12-31T23:55:00.000+0700',
        end: '2022-01-01T01:00:00.000+0700',
        classifierId: '27',
        classifierJobId: '25',
        'sites[]': ['kdibkrnfh84k', 'iehmdkifu485']
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenCalledWith('', {
      start: '2021-12-31T23:55:00.000+0700',
      end: '2022-01-01T01:00:00.000+0700',
      streams: ['kdibkrnfh84k', 'iehmdkifu485'],
      classifications: undefined,
      classifiers: [27],
      classifier_jobs: [25],
      min_confidence: undefined,
      review_statuses: undefined,
      limit: 100,
      offset: 0,
      descending: true,
      fields: [
        'id',
        'stream_id',
        'classifier_id',
        'start',
        'end',
        'confidence',
        'review_status',
        'classification'
      ]
    })
  })

  test('limit offset works correctly when given', async () => {
    // Arrange
    const spy = vi.spyOn(core, 'getDetections')
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'whoami@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/detections',
      query: {
        start: '2021-12-31T23:55:00.000+0700',
        end: '2022-01-01T01:00:00.000+0700',
        classifierId: '27',
        classifierJobId: '25',
        'sites[]': ['kdibkrnfh84k', 'iehmdkifu485'],
        limit: '500',
        offset: '250'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenCalledWith('', {
      start: '2021-12-31T23:55:00.000+0700',
      end: '2022-01-01T01:00:00.000+0700',
      streams: ['kdibkrnfh84k', 'iehmdkifu485'],
      classifications: undefined,
      classifiers: [27],
      classifier_jobs: [25],
      min_confidence: undefined,
      review_statuses: undefined,
      limit: 500,
      offset: 250,
      descending: true,
      fields: [
        'id',
        'stream_id',
        'classifier_id',
        'start',
        'end',
        'confidence',
        'review_status',
        'classification'
      ]
    })
  })
})
