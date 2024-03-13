import { describe, expect, test } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { routesDashboard } from './index'

const PROJECT_ID_BASIC = '40001001'

const ROUTE = '/projects/:projectId/dashboard-data-by-hour'
const url = `/projects/${PROJECT_ID_BASIC}/dashboard-data-by-hour`

const EXPECTED_PROPS = [
  'richnessByHour',
  'detectionByHour'
]

describe(`GET ${ROUTE} (dashboard-data-by-hour)`, () => {
  describe('simple tests', () => {
    test('exists', async () => {
      // Arrange
      const app = await makeApp(routesDashboard)

      // Act
      const routes = [...app.routes.keys()]

      // Assert
      expect(routes).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Arrange
      const app = await makeApp(routesDashboard, { projectRole: 'user' })

      // Act
      const response = await app.inject({
        method: GET,
        url
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props & no more', async () => {
      // Arrange
      const app = await makeApp(routesDashboard, { projectRole: 'user' })

      // Act
      const response = await app.inject({
        method: GET,
        url
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => { expect(result).toHaveProperty(expectedProp) })
      expect(Object.keys(result)).toHaveLength(EXPECTED_PROPS.length)
    })
  })
})
