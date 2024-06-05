import { describe, expect, test } from 'vitest'

import { type DataSource } from '@rfcx-bio/node-common/dao/types'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { routesSync } from './index'

const ROUTE = '/projects/:projectId/sync-history'

const PROJECT_ID = '80001001'

describe(`GET ${ROUTE} (activity dataset)`, () => {
  describe('simple tests', () => {
    test('exists', async () => {
      // Arrange
      const app = await makeApp(routesSync, { projectRole: 'user' })

      // Act
      const routes = [...app.routes.keys()]

      // Assert
      expect(routes).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Arrange
      const app = await makeApp(routesSync, { projectRole: 'user' })

      // Act
      const response = await app.inject({
        method: GET,
        headers: { authorization: 'BEARER AbCdEf123456' },
        url: `/projects/${PROJECT_ID}/sync-history`
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props & no more', async () => {
      // Arrange
      const EXPECTED_PROPS = [
        'syncs'
      ]
      const app = await makeApp(routesSync, { projectRole: 'user' })

      // Act
      const response = await app.inject({
        method: GET,
        headers: { authorization: 'BEARER AbCdEf123456' },
        url: `/projects/${PROJECT_ID}/sync-history`
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => { expect(result).toHaveProperty(expectedProp) })
      expect(Object.keys(result)).toHaveLength(EXPECTED_PROPS.length)
    })
  })

  describe('known data tests', async () => {
    // Arrange & Act once
    const app = await makeApp(routesSync, { projectRole: 'user' })

    const response = await app.inject({
      method: GET,
      headers: { authorization: 'BEARER AbCdEf123456' },
      url: `/projects/${PROJECT_ID}/sync-history`
    })

    test('calculates syncs correctly', async () => {
      // Arrange
      const EXPECTED_PROPS = [
        'id',
        'createdAt',
        'updatedAt',
        'sourceType',
        'dataType',
        'delta'
      ]

      // Assert
      const result = JSON.parse(response.body)?.syncs
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)

      const resultArray = result as DataSource[]
      expect(resultArray).toHaveLength(2)

      const knownSync = resultArray[0]
      expect(knownSync).toBeTypeOf('object')
      EXPECTED_PROPS.forEach(expectedProp => { expect(knownSync).toHaveProperty(expectedProp) })
      expect(Object.keys(knownSync)).toHaveLength(EXPECTED_PROPS.length)
    })
  })

  describe('client errors', () => {
    test('rejects non-project member with 403', async () => {
      // Arrange
      const app = await makeApp(routesSync)

      // Act
      const response = await app.inject({
        method: GET,
        url: `/projects/${PROJECT_ID}/sync-history`
      })

      // Assert
      expect(response.statusCode).toBe(403)
    })
  })
})
