import fastify, { FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { dashboardGeneratedUrl } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'

import { GET } from '~/api-helpers/types'
import { routesDashboard } from './index'

const ROUTE = '/projects/:projectId/dashboard-generated'

const EXPECTED_PROPS = [
  'detectionCount',
  'siteCount',
  'speciesCount',
  'speciesThreatenedCount',
  'maxDate',
  'minDate',
  'speciesThreatened',
  'richnessByTaxon',
  'richnessByRisk',
  'richnessBySite',
  'detectionBySite',
  'richnessByHour',
  'detectionByHour'
]

const getMockedApp = async (): Promise<FastifyInstance> => {
  const app = await fastify()

  routesDashboard
    .map(({ preHandler, ...rest }) => ({ ...rest })) // Remove preHandlers that call external APIs
    .forEach(route => app.route(route))

  return app
}

describe(`GET ${ROUTE}  (dashboard generated)`, () => {
  describe('simple tests', () => {
    test('exists', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const routes = app.printRoutes()

      // Assert
      expect(routes).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: dashboardGeneratedUrl({ projectId: '1' })
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: dashboardGeneratedUrl({ projectId: '1' })
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
    })

    test('does not contain any additional props', async () => {
      // Arrange
      const app = await getMockedApp()

      // Act
      const response = await app.inject({
        method: GET,
        url: dashboardGeneratedUrl({ projectId: '1' })
      })

      // Assert
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    })
  })

  describe('known data tests', async () => {
    // Arrange & Act once
    const app = await getMockedApp()

    const response = await app.inject({
      method: GET,
      url: dashboardGeneratedUrl({ projectId: '1' })
    })

    test.todo('species richness by site is correct', async () => {
      // Arrange
      // const knownSiteId = 123

      // Act
      const result = JSON.parse(response.body)?.richnessBySite
      expect(result).toBeDefined()
    })

    test.todo('species richness by site is empty', async () => {
      // Arrange
      // const knownSiteId = 123

      // Act
      const result = JSON.parse(response.body)?.richnessBySite
      expect(result).toBeDefined()
    })
  })
})
