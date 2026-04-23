import { describe, expect, test, vi } from 'vitest'

import { EXPORT_DETECTIONS_TYPES } from '@rfcx-bio/common/api-bio/cnn/export-detections'
import * as k8sJob from '@rfcx-bio/node-common/kubernetes/job'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import * as bll from './export-detections-bll'
import { routesCnn } from './index'

const { LocationProject } = modelRepositoryWithElevatedPermissions

vi.mock('@rfcx-bio/node-common/kubernetes', () => {
  return {
    createJob: vi.fn(async () => {})
  }
})

describe('POST /jobs/:jobId/detections-export', () => {
  test('blocks export for view-only project', async () => {
    await LocationProject.create({ ...makeProject(64859, 'Pandas of China', 'listed'), idCore: 'kd953mgodif9', entitlementState: 'inactive', viewOnlyEffective: true })

    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'grindarius@rfcx.org'
      }
    })

    const response = await app.inject({
      method: 'POST',
      url: '/jobs/121/detections-export',
      headers: { authorization: 'Bearer token' },
      payload: {
        types: ['all-model-detections']
      }
    })

    expect(response.statusCode).toEqual(403)
    expect(response.json().message).toContain('cannot request exports or backups')

    await LocationProject.destroy({ where: { id: 64859 }, force: true })
  })

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
    expect(spy).toHaveBeenCalledWith('', 121, EXPORT_DETECTIONS_TYPES, 'grindarius@rfcx.org')
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
    expect(spy).toHaveBeenCalledWith('', 122, ['all-model-detections'], 'grindarius@rfcx.org')
    expect(response.statusCode).toEqual(201)
  })

  test('email passed inside will be hashed on to the metadata', async () => {
    const spy = vi.spyOn(k8sJob, 'exportDetectionsJob')
    await LocationProject.create({ ...makeProject(64860, 'Pandas of China', 'listed'), idCore: 'kd953mgodif9' })
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
    await LocationProject.destroy({ where: { id: 64860 }, force: true })
  })
})
