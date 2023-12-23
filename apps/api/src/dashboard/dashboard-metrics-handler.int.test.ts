import { describe, expect, test } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { routesDashboard } from './index'

const PROJECT_ID_BASIC = '40001001'

const ROUTE = '/projects/:projectId/dashboard-metrics'
const url = `/projects/${PROJECT_ID_BASIC}/dashboard-metrics`

const EXPECTED_PROPS = [
  'totalSites',
  'threatenedSpecies',
  'totalSpecies',
  'totalDetections',
  'totalRecordings',
  'maxDate',
  'minDate'
]

describe(`GET ${ROUTE} (dashboard-metrics)`, () => {
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
      const app = await makeApp(routesDashboard)

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
      const app = await makeApp(routesDashboard)

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

  describe.todo('known data tests')
})
