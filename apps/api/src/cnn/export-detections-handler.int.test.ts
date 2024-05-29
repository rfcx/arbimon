import { describe, expect, test } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { routesCnn } from './index'

describe('POST /jobs/:jobId/detections-export', () => {
  test('route exists', async () => {
    // Arrange
    const app = await makeApp(routesCnn, { userToken: { email: 'grindarius@rfcx.org' } })

    // Act
    const keys = [...app.routes.keys()]

    // Assert
    expect(keys.includes('/jobs/:jobId/detections-export')).toEqual(true)
  })
})
