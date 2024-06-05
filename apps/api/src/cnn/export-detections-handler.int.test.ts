import { describe, expect, test, vi } from 'vitest'

import { EXPORT_DETECTIONS_TYPES } from '@rfcx-bio/common/api-bio/cnn/export-detections'
import * as k8sJob from '@rfcx-bio/node-common/kubernetes/job'
import { makeApp } from '@rfcx-bio/testing/handlers'

import * as bll from './export-detections-bll'
import { routesCnn } from './index'

vi.mock('@rfcx-bio/node-common/kubernetes', () => {
  return {
    createJob: vi.fn(async () => {})
  }
})

describe('POST /jobs/:jobId/detections-export', () => {
  test('route exists', async () => {
    // Arrange
    const app = await makeApp(routesCnn, { userToken: { email: 'grindarius@rfcx.org' } })

    // Act
    const keys = [...app.routes.keys()]

    // Assert
    expect(keys).toContain('/jobs/:jobId/detections-export')
  })

  test('string job id will be rejected', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'grindarius@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/jobs/abc/detections-export'
    })

    expect(response.statusCode).toEqual(400)
  })

  test('if no export types are given, all export types are used', async () => {
    const spy = vi.spyOn(bll, 'exportDetections')
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'grindarius@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/jobs/121/detections-export',
      payload: {
        types: []
      }
    })

    // Assert
    expect(spy).toHaveBeenCalledWith(121, EXPORT_DETECTIONS_TYPES, 'grindarius@rfcx.org')
    expect(response.statusCode).toEqual(201)
  })

  test('correctly parses export types', async () => {
    const spy = vi.spyOn(bll, 'exportDetections')
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'grindarius@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/jobs/122/detections-export',
      payload: {
        types: ['all-model-detections']
      }
    })

    // Assert
    expect(spy).toHaveBeenCalledWith(122, ['all-model-detections'], 'grindarius@rfcx.org')
    expect(response.statusCode).toEqual(201)
  })

  test('email passed inside will be hashed on to the metadata', async () => {
    const spy = vi.spyOn(k8sJob, 'exportDetectionsJob')
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'grindarius@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/jobs/128/detections-export',
      payload: {
        types: ['all-model-detections']
      }
    })

    // Assert
    expect(response.statusCode).toEqual(201)
    expect(spy.mock.results[0].value).toHaveProperty('metadata.name', 'arbimon-export-detections-128-343f27cb')
  })
})
