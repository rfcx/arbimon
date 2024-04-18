import { describe, expect, test } from 'vitest'

import { type ApiMap } from '@rfcx-bio/common/api-bio/_helpers'
import { type Site } from '@rfcx-bio/common/dao/types'
import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { routesDashboard } from './index'

const PROJECT_ID_BASIC = '40001001'

const ROUTE = '/projects/:projectId/dashboard-data-by-site'
const url = `/projects/${PROJECT_ID_BASIC}/dashboard-data-by-site`

const EXPECTED_PROPS = [
  'richnessBySite'
]

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

  describe('known data tests', async () => {
    // Arrange & Act once
    const app = await makeApp(routesDashboard, { projectRole: 'user' })

    const response = await app.inject({
      method: GET,
      url
    })

    test('species richness by site is correct', async () => {
      // Arrange
      const knownSiteName = 'Test Site Dashboard Basic'
      const expectedProperties = ['name', 'latitude', 'longitude', 'value', 'taxonClassId']
      const expectedKnownSite = { name: knownSiteName, latitude: 17.962779, longitude: -66.201552, value: 1, taxonClassId: 600 }

      // Act
      const maybeResult = JSON.parse(response.body)?.richnessBySite

      // Assert - property exists & correct type
      expect(maybeResult).toBeDefined()
      expect(Array.isArray(maybeResult)).toBe(true)

      const result = maybeResult as ApiMap
      expect(result).toHaveLength(2) // 2 rows of data (taxon_class 100 & 600) - 1 amphibian, 1 mammal

      // Assert - first result is object
      const maybeKnownSite = result.find(bySite => bySite.name === knownSiteName)
      expect(maybeKnownSite).toBeTypeOf('object')
      const knownSite = maybeKnownSite as Pick<Site, 'name' | 'latitude' | 'longitude'> & { value: number, taxonClassId?: number | undefined }

      // Assert - first result contains (only) expected props
      expectedProperties.forEach(expectedProperty => { expect(knownSite).toHaveProperty(expectedProperty) })
      Object.keys(knownSite).forEach(actualProperty => { expect(expectedProperties).toContain(actualProperty) })

      // Assert - latitude, longitude, and value are correct
      expect(knownSite).toStrictEqual(expectedKnownSite)
    })

    test.todo('species richness by site is empty', async () => {
      // Arrange
      const knownSiteName = 'Test Site Dashboard Empty'
      const expectedProperties = ['name', 'latitude', 'longitude', 'value', 'taxonClassId']
      const expectedKnownSite = { name: knownSiteName, latitude: 18.31307, longitude: -65.24878, value: 0, taxonClassId: 100 }

      // Act
      const maybeResult = JSON.parse(response.body)?.richnessBySite

      // Assert - property exists & correct type
      expect(maybeResult).toBeDefined()
      expect(Array.isArray(maybeResult)).toBe(true)

      const result = maybeResult as ApiMap
      expect(result).toHaveLength(1)

      // Assert - first result is object
      const maybeKnownSite = result.find(bySite => bySite.name === knownSiteName)
      expect(maybeKnownSite).toBeTypeOf('object')
      const knownSite = maybeKnownSite as Pick<Site, 'name' | 'latitude' | 'longitude'> & { value: number, taxonClassId?: number | undefined }

      // Assert - first result contains (only) expected props
      expectedProperties.forEach(expectedProperty => { expect(knownSite).toHaveProperty(expectedProperty) })
      Object.keys(knownSite).forEach(actualProperty => { expect(expectedProperties).toContain(actualProperty) })

      // Assert - latitude, longitude, and value are correct
      expect(knownSite.latitude).toStrictEqual(expectedKnownSite)
    })
  })
})
