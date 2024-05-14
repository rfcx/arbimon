import { describe, expect, test, vi } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import * as core from '../_services/api-core/api-core'
import { routesCnn } from './index'

vi.mock('../_services/api-core/api-core')

const jobId = 101

describe('GET /jobs/:jobId/best-detections', async () => {
  test('successfully get all the data', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'liaml98@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/best-detections`,
      query: {
        byDate: 'true'
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(Array.isArray(json)).toBeTruthy()
    expect(json).toHaveProperty('[0].id')
    expect(json).toHaveProperty('[0].siteIdCore')
    expect(json).toHaveProperty('[0].classifierId')
    expect(json).toHaveProperty('[0].start')
    expect(json).toHaveProperty('[0].end')
    expect(json).toHaveProperty('[0].confidence')
    expect(json).toHaveProperty('[0].classification')
    expect(json).toHaveProperty('[0].dailyRanking')
    expect(json).toHaveProperty('[0].streamRanking')
  })

  test('invalid dates will get an error', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'liaml98@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/best-detections`,
      query: {
        start: 'what',
        byDate: 'true'
      }
    })

    expect(response.statusCode).toEqual(400)
  })

  test('array review status parsed correctly', async () => {
    const spy = vi.spyOn(core, 'getBestDetections')

    // Arrange
    const app = await makeApp(routesCnn, {
      userToken: {
        email: 'liaml98@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/best-detections`,
      query: {
        byDate: 'true',
        'reviewStatus[]': ['unvalidated', 'present']
      }
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    expect(spy).toHaveBeenCalledWith('', jobId, {
      start: undefined,
      end: undefined,
      streams: undefined,
      by_date: true,
      review_statuses: ['unreviewed', 'confirmed'],
      n_per_stream: undefined,
      limit: undefined,
      offset: undefined,
      fields: [
        'id',
        'stream_id',
        'classifier_id',
        'start',
        'end',
        'confidence',
        'review_status'
      ]
    })
  })
})
