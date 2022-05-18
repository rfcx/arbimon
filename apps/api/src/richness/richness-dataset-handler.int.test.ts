import { describe, expect, test } from 'vitest'

import { richnessDatasetUrl, RichnessSiteData } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { getInjectAsLoggedInProjectMember, getMockedFastify } from '@/_testing/get-inject'
import { GET } from '~/api-helpers/types'
import { routesRichness } from './index'

const ROUTE = '/projects/:projectId/richness'

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'richnessByTaxon',
  'richnessBySite',
  'richnessByTimeHourOfDay',
  'richnessByTimeDayOfWeek',
  'richnessByTimeMonthOfYear',
  'richnessByTimeUnix',
  'richnessPresence'
]

const TEST_PROJECT_ID = '10001'

describe(`GET ${ROUTE} (richness dataset)`, async () => {
  const routes = routesRichness
  const injectAsLoggedInProjectMember = await getInjectAsLoggedInProjectMember(routes)

  describe('happy path', () => {
    test('exists', async () => {
      // Arrange
      const app = await getMockedFastify({ routes })

      // Act
      const routeList = app.printRoutes()

      // Assert
      expect(routeList).toContain(ROUTE)
    })

    test('returns successfully', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: richnessDatasetUrl({ projectId: TEST_PROJECT_ID }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
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
        url: richnessDatasetUrl({ projectId: TEST_PROJECT_ID }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
      expect(Object.keys(result).length).toBe(EXPECTED_PROPS.length)
    })
  })

  describe('validate known data', async () => {
    test('does not have any data on given date', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: richnessDatasetUrl({ projectId: TEST_PROJECT_ID }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2002-01-01T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))

      expect(result.richnessBySite).toEqual([])
      expect(result.richnessByTaxon).toEqual({})
      expect(result.richnessByTimeDayOfWeek).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 })
      expect(result.richnessByTimeUnix).toEqual({})
      expect(result.richnessPresence).toEqual({})
    })

    test('test isLocationRedacted', async () => {
      const url = richnessDatasetUrl({ projectId: TEST_PROJECT_ID })
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })
      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
      expect(result.isLocationRedacted).toBeFalsy()
    })

    test.todo('calculates richnessBySite correctly', async () => {
      const url = richnessDatasetUrl({ projectId: TEST_PROJECT_ID })
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
      })

      // Arrange
      const locationSiteId = 143888
      const richness = 2
      const taxonClassId = 1
      const siteExpectedProperties = ['locationSiteId', 'richness', 'taxonClassId']

      // Act
      const result = JSON.parse(response.body)?.richnessBySite

      // Assert - property exists & correct type
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      const res = result as RichnessSiteData[]
      expect(res.length).toBe(1)

      // Assert - first result is object
      const testedSite = result.find((site: RichnessSiteData) => site.locationSiteId === locationSiteId)
      expect(testedSite).toBeTypeOf('object')
      const site = testedSite as Record<string, any>

      // Assert - first result contains (only) expected props
      siteExpectedProperties.forEach(expectedProperty => expect(site).toHaveProperty(expectedProperty))
      Object.keys(site).forEach(actualProperty => expect(siteExpectedProperties).toContain(actualProperty))

      // Assert - detection, detection frequency, occupancy are correct
      expect(site.richness).toBe(richness)
      expect(site.richness).toBe(taxonClassId)
    })
    test.todo('richnessBySite -> check locationSiteId, richness, taxonClassId of the first item in array', async () => {})
    test.todo('does not duplicates sites for richnessBySite', async () => {})
    test.todo('check specific calculation in richnessBySite', async () => {})

    test.todo('use right calculation/check values of richnessByTaxon', async () => {})
    test.todo('check specific calculation in richnessByTaxon', async () => {})
    test.todo('does not duplicates values for richnessByTaxon', async () => {})

    test.todo('use right calculation/check values of richnessByTimeDayOfWeek', async () => {})
    test.todo('check specific calculation in richnessByTimeDayOfWeek', async () => {})
    test.todo('does not duplicates values for richnessByTimeDayOfWeek', async () => {})

    test.todo('use right calculation/check values of richnessByTimeHourOfDay', async () => {})
    test.todo('check specific calculation in richnessByTimeHourOfDay', async () => {})
    test.todo('does not duplicates values for richnessByTimeHourOfDay', async () => {})

    test.todo('richnessByTimeUnix in a correct time range data', async () => {})
    test.todo('use right calculation/check values of richnessByTimeUnix', async () => {})
    test.todo('check specific calculation in richnessByTimeUnix', async () => {})
    test.todo('does not duplicates values for richnessByTimeUnix', async () => {})

    test.todo('use right calculation/check values of richnessPresence', async () => {})
    test.todo('check specific calculation in richnessPresence', async () => {})
    test.todo('does not duplicates values for richnessPresence', async () => {})
  })

  describe('client errors', () => {
    test('rejects missing query', async () => {
        // Act
        const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: richnessDatasetUrl({ projectId: TEST_PROJECT_ID })
      })

      // Assert
      expect(response.statusCode).toBe(400)
    })

    test('rejects invalid project id', async () => {
        // Act
        const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: richnessDatasetUrl({ projectId: 'x' })
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid path params: projectId')
    })

    test('rejects invalid date', async () => {
        // Act
        const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: richnessDatasetUrl({ projectId: TEST_PROJECT_ID }),
        query: { startDate: 'abc', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid query params')
      expect(errorMessage).toContain('startDate with value')
    })
  })
})
