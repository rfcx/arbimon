import fastify, { FastifyInstance } from 'fastify'
import { describe, expect, test } from 'vitest'

import { ApiMap } from '@rfcx-bio/common/api-bio/_helpers'
import { dashboardGeneratedUrl } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { Site } from '@rfcx-bio/common/dao/types'

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

    test('species richness by site is correct', async () => {
      // Arrange
      const knownSiteName = 'SA09'
      const expectedProperties = ['name', 'latitude', 'longitude', 'value']

      // Act
      const maybeResult = JSON.parse(response.body)?.richnessBySite

      // Assert - property exists & correct type
      expect(maybeResult).toBeDefined()
      expect(Array.isArray(maybeResult)).toBe(true)

      const result = maybeResult as ApiMap
      expect(result.length).toBe(877)

      // Assert - first result is object
      const maybeKnownSite = result.find(bySite => bySite.name === knownSiteName)
      expect(maybeKnownSite).toBeTypeOf('object')
      const knownSite = maybeKnownSite as Pick<Site, 'name' | 'latitude' | 'longitude'> & { value: number }

      // Assert - first result contains (only) expected props
      expectedProperties.forEach(expectedProperty => expect(knownSite).toHaveProperty(expectedProperty))
      Object.keys(knownSite).forEach(actualProperty => expect(expectedProperties).toContain(actualProperty))

      // Assert - latitude, longitude, and value are correct
      expect(knownSite.latitude).toBe(17.962779)
      expect(knownSite.longitude).toBe(-66.201552)
      expect(knownSite.value).toBe(14)
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
