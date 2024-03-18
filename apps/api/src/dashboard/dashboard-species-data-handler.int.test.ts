import { describe, expect, test } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { routesDashboard } from './index'

const PROJECT_ID_BASIC = '40001001'

const ROUTE = '/projects/:projectId/dashboard-species-data'
const url = `/projects/${PROJECT_ID_BASIC}/dashboard-species-data`

const EXPECTED_PROPS = [
  'speciesHighlighted',
  'richnessByRisk',
  'richnessByTaxon',
  'totalSpeciesCount'
]

describe(`GET ${ROUTE} (dashboard-species-data)`, () => {
  describe('simple tests', () => {
    test('exists', async () => {
      // Arrange
      const app = await makeApp(routesDashboard)

      // Act
      const routes = [...app.routes.keys()]

      // Assert
      expect(routes).toContain(ROUTE)
    }, 10000)

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
    }, 10000)

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
    }, 10000)
  })
})
