import { describe, expect, test } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { routesDetect } from '..'

const fakeProjectId = 201

const ROUTE = '/projects/:projectId/detect-recording'

const EXPECTED_PROPS = [
  'totalDurationInMinutes'
]

describe('GET /project/:projectId/detect-recording', () => {
  describe('simple tests', () => {
    test('exists', async () => {
      // Arrange
      const app = await makeApp(routesDetect, { projectRole: 'user' })

      // Act
      const routes = [...app.routes.keys()]

      // Assert
      expect(routes).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Arrange
      const app = await makeApp(routesDetect, { projectRole: 'user' })

      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2001-01-01', dateEndLocal: '2031-01-01' }
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props', async () => {
      // Arrange
      const app = await makeApp(routesDetect, { projectRole: 'user' })

      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2001-01-01', dateEndLocal: '2031-01-01' }
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => { expect(result).toHaveProperty(expectedProp) })
    })

    test('does not contain any additional props', async () => {
      // Arrange
      const app = await makeApp(routesDetect, { projectRole: 'user' })

      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2001-01-01', dateEndLocal: '2031-01-01' }
      })

      // Assert
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => { expect(EXPECTED_PROPS).toContain(actualProp) })
    })
  })

  describe('known data tests', async () => {
    // Arrange once
    const app = await makeApp(routesDetect, { projectRole: 'user' })

    test('return all exists data without queryHours (all day)', async () => {
      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2001-01-01', dateEndLocal: '2031-01-01' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expect(result.totalDurationInMinutes).toBe(1084.5)
    })

    test('return all exists data with queryHours (all day)', async () => {
      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2001-01-01', dateEndLocal: '2031-01-01', queryHours: '0-23' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expect(result.totalDurationInMinutes).toBe(1084.5)
    })

    test('return all exists data with specific date with ISO date format (all day)', async () => {
      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2022-02-15T00:00:00.000Z', dateEndLocal: '2022-02-15T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expect(result.totalDurationInMinutes).toBe(723)
    })

    test('return all exists data with specific date (all day)', async () => {
      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2022-02-15', dateEndLocal: '2022-02-15' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expect(result.totalDurationInMinutes).toBe(723)
    })

    test('return all exists data with specific date and queryHours (all day)', async () => {
      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2022-02-15', dateEndLocal: '2022-02-15', queryHours: '0-23' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expect(result.totalDurationInMinutes).toBe(723)
    })

    test('return all exists data with specific date and queryHours (specific time range)', async () => {
      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2022-02-15', dateEndLocal: '2022-02-15', queryHours: '10,12-15' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expect(result.totalDurationInMinutes).toBe(542.25)
    })

    test('return all exists data with querySites (all day)', async () => {
      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2022-02-15', dateEndLocal: '2022-02-15', querySites: 'CU26' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expect(result.totalDurationInMinutes).toBe(120.5)
    })

    test('return all exists data with * querySites (all day)', async () => {
      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2022-02-15', dateEndLocal: '2022-02-17', querySites: 'CU*' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expect(result.totalDurationInMinutes).toBe(964)
    })

    test('return empty data from non data by date', async () => {
      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2022-02-14', dateEndLocal: '2022-02-14' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expect(result.totalDurationInMinutes).toBe(0)
    })

    test('return empty data from non data by time', async () => {
      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2022-02-15', dateEndLocal: '2022-02-17', queryHours: '1-9,11,13,14,16-22' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expect(result.totalDurationInMinutes).toBe(0)
    })
  })

  describe('client errros', () => {
    test('reject missing query', async () => {
      // Arrange
      const app = await makeApp(routesDetect, { projectRole: 'user' })

      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`
      })

      // Assert
      expect(response.statusCode).toBe(400)
    })

    test('reject not exist project id', async () => {
      // Arrange
      const app = await makeApp(routesDetect, { projectRole: 'user' })

      // Act
      const response = await app.inject({
        method: GET,
        url: '/projects/999999/detect-recording',
        query: { dateStartLocal: '2021-01-01', dateEndLocal: '2021-01-01' }
      })

      // Assert
      expect(response.statusCode).toBe(404)
    })

    test('rejects invalid project id', async () => {
      // Arrange
      const app = await makeApp(routesDetect, { projectRole: 'user' })

      // Act
      const response = await app.inject({
        method: GET,
        url: '/projects/x/detect-recording'
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid path params: projectId')
    })

    test('rejects invalid date', async () => {
      // Arrange
      const app = await makeApp(routesDetect, { projectRole: 'user' })

      // Act
      const response1 = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: 'abc', dateEndLocal: '2021-01-01' }
      })

      const response2 = await app.inject({
        method: GET,
        url: `/projects/${fakeProjectId}/detect-recording`,
        query: { dateStartLocal: '2021-01-01', dateEndLocal: 'abc' }
      })

      // Assert
      expect(response1.statusCode).toBe(400)
      expect(response2.statusCode).toBe(400)

      const result1 = JSON.parse(response1.body)
      const result2 = JSON.parse(response2.body)
      expect(result1.message).toContain('dateStartLocal')
      expect(result2.message).toContain('dateEndLocal')
    })
  })
})
