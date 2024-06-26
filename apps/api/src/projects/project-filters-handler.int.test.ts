import { describe, expect, test } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { routesProject } from './index'

const PROJECT_ID_BASIC = '50001001'

const ROUTE = '/projects/:projectId/filters'
const url = `/projects/${PROJECT_ID_BASIC}/filters`

const EXPECTED_PROPS = [
  'locationSites',
  'taxonClasses',
  'dateStartInclusiveUtc',
  'dateEndInclusiveUtc',
  'latestSync'
]

describe(`GET ${ROUTE} (project filters dataset)`, async () => {
  describe('simple tests', async () => {
    test('exists', async () => {
      // Arrange
      const app = await makeApp(routesProject, { projectRole: 'external' })

      // Act
      const routes = [...app.routes.keys()]

      // Assert
      expect(routes).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Arrange
      const app = await makeApp(routesProject, { projectRole: 'external' })

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
      const app = await makeApp(routesProject, { projectRole: 'external' })

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
  describe('known data tests', async () => {
    // Arrange & Act once
    const app = await makeApp(routesProject, { projectRole: 'external' })

    const response = await app.inject({
      method: GET,
      url
    })

    const result = JSON.parse(response.body)

    test('return all sites in project', async () => {
      expect(result.locationSites.length).toEqual(2)
    })
  })
})
