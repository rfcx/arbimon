import { describe, expect, test } from 'vitest'

import { ApiMap } from '@rfcx-bio/common/api-bio/_helpers'
import { dashboardGeneratedUrl } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Site } from '@rfcx-bio/common/dao/types'

import { getInjectAsLoggedInProjectMember, getMockedFastify } from '@/_testing/get-inject'
import { GET } from '~/api-helpers/types'
import { getSequelize } from '~/db'
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

const createMockEmptySite = async (): Promise<Site> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)
  const site = await models.LocationSite.create({
    id: 999999,
    idCore: 'MockEmpty',
    idArbimon: 999999,
    locationProjectId: 1,
    name: 'Mock empty',
    latitude: 70,
    longitude: 70,
    altitude: 30
  })
  return site
}

describe(`GET ${ROUTE}  (dashboard generated)`, async () => {
  const routes = routesDashboard
  const injectAsLoggedInProjectMember = await getInjectAsLoggedInProjectMember(routes)

  describe('simple tests', () => {
    test('exists', async () => {
      // Arrange
      const app = await getMockedFastify({ routes })

      // Act
      // const routes = [...app.routes.keys()]
      const routeList = app.printRoutes()

      // Assert
      expect(routeList).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: dashboardGeneratedUrl({ projectId: '1' })
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props & no more', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: dashboardGeneratedUrl({ projectId: '1' })
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
      expect(Object.keys(result).length).toBe(EXPECTED_PROPS.length)
    })
  })

  describe('known data tests', async () => {
    // Act
    const response = await injectAsLoggedInProjectMember({
      method: GET,
      url: dashboardGeneratedUrl({ projectId: '1' })
    })

    test.todo('species richness by site is correct', async () => {
      // Arrange
      const knownSiteName = 'SA09'
      const expectedProperties = ['name', 'latitude', 'longitude', 'value']
      const expectedKnownSite = { name: knownSiteName, latitude: 17.962779, longitude: -66.201552, value: 6 }

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
      expect(knownSite).toStrictEqual(expectedKnownSite)
    })

    test.todo('species richness by site is empty', async () => {
      // Arrange
      const emptySite = await createMockEmptySite()
      const knownSiteName = emptySite.name
      const expectedProperties = ['name', 'latitude', 'longitude', 'value']
      const expectedKnownSite = { name: knownSiteName, latitude: emptySite.latitude, longitude: emptySite.longitude, value: 0 }

      // Act
      const maybeResult = JSON.parse(response.body)?.richnessBySite

      // Assert - property exists & correct type
      expect(maybeResult).toBeDefined()
      expect(Array.isArray(maybeResult)).toBe(true)

      const result = maybeResult as ApiMap
      expect(result.length).toBe(878)

      // Assert - first result is object
      const maybeKnownSite = result.find(bySite => bySite.name === knownSiteName)
      expect(maybeKnownSite).toBeTypeOf('object')
      const knownSite = maybeKnownSite as Pick<Site, 'name' | 'latitude' | 'longitude'> & { value: number }

      // Assert - first result contains (only) expected props
      expectedProperties.forEach(expectedProperty => expect(knownSite).toHaveProperty(expectedProperty))
      Object.keys(knownSite).forEach(actualProperty => expect(expectedProperties).toContain(actualProperty))

      // Assert - latitude, longitude, and value are correct
      expect(knownSite.latitude).toStrictEqual(expectedKnownSite)
    })
  })
})
