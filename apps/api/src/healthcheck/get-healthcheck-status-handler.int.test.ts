import { describe, expect, test, vi } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import * as db from '../_services/db'
import { routesHealthCheck } from './index'

describe('GET /health-check', async () => {
  test('Correctly get the status when the database is up and running', async () => {
    // Arrange
    const app = await makeApp(routesHealthCheck)

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/health-check'
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toHaveProperty('up', true)
    expect(json).toHaveProperty('databaseConnectionTimeMs')
  })

  test('up being false when the database is out of react', async () => {
    // Arrange
    const spy = vi.spyOn(db, 'authenticateDatabase')
    spy.mockReturnValue(Promise.resolve(false))
    const app = await makeApp(routesHealthCheck)

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/health-check'
    })

    // Assert
    expect(response.statusCode).toEqual(500)
    const json = response.json()
    expect(json).toHaveProperty('up', false)
  })
})
