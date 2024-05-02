import { describe, expect, test, vi } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { routesCnn } from './index'

const jobId = 101
const classificationValue = 'sciurus_carolinensis_simple_call_2'

vi.mock('../_services/api-core/api-core')

describe('GET /jobs/:jobId/classifications/:classificationValue', async () => {
  test('successfully get classification information by classification value', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'rubygem1934@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/classifications/${classificationValue}`
    })

    // Assert
    expect(response.statusCode).toEqual(200)
    const json = response.json()
    expect(json).toHaveProperty('title', 'Sciurus carolinensis, Simple call 2')
    expect(json).toHaveProperty('total', 1732)
    expect(json).toHaveProperty('streams', [
      {
        id: 'kdivmdkfogie',
        name: 'GU01'
      }
    ])
  })

  test('non-rfcx member will get a 403', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'rubygem1218@gmail.com'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/${jobId}/classifications/${classificationValue}`
    })

    // Assert
    expect(response.statusCode).toEqual(403)
  })

  test('an invalid jobId (string) will result in 400', async () => {
    // Arrange
    const app = await makeApp(routesCnn, {
      projectRole: 'user',
      userToken: {
        email: 'rubygeme@rfcx.org'
      }
    })

    // Act
    const response = await app.inject({
      method: 'GET',
      url: `/jobs/who/classifications/${classificationValue}`
    })

    console.info(response.body)

    // Assert
    expect(response.statusCode).toEqual(400)
  })
})
