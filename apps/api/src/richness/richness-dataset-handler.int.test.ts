import { HTTPMethods } from 'fastify'
import { beforeEach, describe, expect, test } from 'vitest'

import { richnessDatasetUrl, RichnessSiteData } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { getInjectAsInvalidToken, getInjectAsLoggedInNotProjectMember, getInjectAsLoggedInProjectMember, getInjectAsLoggedOut, getMockedFastify } from '@/_testing/get-inject'
import { GET } from '~/api-helpers/types'
import { routesRichness } from './index'

interface InjectOptions {
  method: HTTPMethods
  url?: string
  query?: {
    startDate: string
    endDate: string
    siteIds?: string
    taxons?: string
  }
}

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

const PROJECT_ID_BASIC = '10001'
const PROJECT_ID_NO_SITES = '10002'
const PROJECT_ID_NO_DETECTIONS = '10003'
const PROJECT_ID_ONE_DETECTION = '10004'

describe(`GET ${ROUTE} (richness dataset)`, async () => {
  const routes = routesRichness
  const injectAsLoggedInProjectMember = await getInjectAsLoggedInProjectMember(routes)
  const injectAsLoggedInNotProjectMember = await getInjectAsLoggedInNotProjectMember(routes)
  const injectAsLoggedOut = await getInjectAsLoggedOut(routes)
  const injectAsInvalidToken = await getInjectAsInvalidToken(routes)

  describe('happy path', () => {
    test('exists', async () => {
      // Arrange
      const app = await getMockedFastify({ routes })

      // Act
      const routeList = app.printRoutes()

      // Assert
      expect(routeList).toContain(ROUTE)
    })

    test('contains all expected props & no more', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: richnessDatasetUrl({ projectId: PROJECT_ID_BASIC }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
      expect(Object.keys(result).length).toBe(EXPECTED_PROPS.length)
    })

    describe('check response status code for users with different injection', async () => {
      let options: InjectOptions
      beforeEach(async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        options = {
          method: GET,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        }
      })
      test('returns successfully for logged in project member', async () => {
        // Act
        const response = await injectAsLoggedInProjectMember(options)

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
      })
      // TODO: return empty data for logged out user (?)
      test('returns successfully for logged out user', async () => {
        // Act
        const response = await injectAsLoggedOut(options)

         // Assert
         expect(response.statusCode).toBe(200)
         const result = JSON.parse(response.body)
         expect(result).toBeDefined()
         expect(result).toBeTypeOf('object')
      })
      // TODO: return 403 code for user is logged in as not project member (?)
      test('returns successfully if the user is logged in as NOT project member', async () => {
        // Act
        const response = await injectAsLoggedInNotProjectMember(options)

         // Assert
         expect(response.statusCode).toBe(200)
         const result = JSON.parse(response.body)
         expect(result).toBeDefined()
         expect(result).toBeTypeOf('object')
      })
      // TODO: return 401 code for user with invalid token (?)
      test('returns successfully for user with invalid token', async () => {
        // Act
        const response = await injectAsInvalidToken(options)

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
      })
    })
  })

  describe('validate known data', async () => {
    // TODO: return 404 code for richness if have not any data (?)
    describe('check empty response in different cases', async () => {
      let options: InjectOptions
      beforeEach(async () => {
        options = {
          method: GET
        }
      })
      test('does not have any data on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
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
      test('does not have any data in project without sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_NO_SITES })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
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
      test('does not have any detections in project without detections', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_NO_DETECTIONS })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
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
    })

    describe('test isLocationRedacted with different injection', async () => {
      let options: InjectOptions
      beforeEach(async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        options = {
          method: GET,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
        }
      })
      test('isLocationRedacted should be false if logged in as project member', async () => {
        // Act
        const response = await injectAsLoggedInProjectMember(options)

        // Assert
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.isLocationRedacted).toBeFalsy()
      })
      test('isLocationRedacted should be true if logged out', async () => {
        // Act
        const response = await injectAsLoggedOut(options)

        // Assert
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.isLocationRedacted).toBeTruthy()
      })
      // TODO: return 403 code for user is logged in as not project member (?)
      test('isLocationRedacted should be true if if logged in as NOT project member', async () => {
        // Act
        const response = await injectAsLoggedInNotProjectMember(options)

        // Assert
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.isLocationRedacted).toBeTruthy()
      })
      // TODO: return 401 code for user with invalid token (?)
      test('isLocationRedacted should be true if token is invalid', async () => {
        // Act
        const response = await injectAsInvalidToken(options)

        // Assert
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.isLocationRedacted).toBeTruthy()
      })
    })

    describe('calculates detections correctly', async () => {
      let options: InjectOptions
      beforeEach(async () => {
        options = {
          method: GET
        }
      })
      test('richnessByTaxon have to include one type of species with count equal to 1', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_ONE_DETECTION })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        })

        // Assert
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')

        const oneSpeciesInArray = Object.keys(result.richnessByTaxon).length
        const oneSpeciesCount = Object.values(result.richnessByTaxon)[0]
        expect(oneSpeciesInArray).toEqual(1)
        expect(oneSpeciesCount).toEqual(1)
      })
      test('richnessByTaxon have to include one type of filtered species with count equal to 2', async () => {
        // Act
        const taxonClassId = '300'
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', taxons: taxonClassId }
        })

        // Assert
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        const twoSpeciesSameTaxonInArray = Object.keys(result.richnessByTaxon).length
        const twoSpeciesSameTaxonCount = result.richnessByTaxon[taxonClassId]
        expect(twoSpeciesSameTaxonInArray).toEqual(1)
        expect(twoSpeciesSameTaxonCount).toEqual(2)
      })
      test('richnessByTaxon have to include two type of filtered species', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', taxons: ['100', '300'] }
        })

        // Assert
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        const twoSpeciesSameTaxonInArray = Object.keys(result.richnessByTaxon).length
        const taxon1 = result.richnessByTaxon['100']
        const taxon2 = result.richnessByTaxon['300']
        expect(twoSpeciesSameTaxonInArray).toEqual(2)
        expect(taxon1).toEqual(1)
        expect(taxon2).toEqual(2)
      })
      test('richnessByTaxon have to include 3 types of species', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        })

        // Assert
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(Object.keys(result.richnessByTaxon).length).toEqual(3)
      })

      test('richnessBySite have to include 3 objects with different location site id or different taxon class id if the site id is the same', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        })

        // Assert
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
        expect(result.richnessBySite.length).toEqual(3)
        const firstItem = result.richnessBySite[0]
        const secondItem = result.richnessBySite[1]
        const thirdItem = result.richnessBySite[2]
        const firstItemSiteId = firstItem.locationSiteId
        const secondItemSiteId = secondItem.locationSiteId
        const thirdItemSiteId = thirdItem.locationSiteId
        // Check site id
        expect(firstItemSiteId).toEqual(secondItemSiteId)
        expect(firstItemSiteId).not.toEqual(thirdItemSiteId)

        // Check if the same site item have different taxon class
        expect(firstItem.taxonClassId).not.toEqual(secondItem.taxonClassId)
      })
    })

    test('calculates richnessBySite correctly', async () => {
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
      })

      // Arrange
      const locationSiteId = 10001001
      const richness = 1
      const taxonClassId = 100
      const siteExpectedProperties = ['locationSiteId', 'richness', 'taxonClassId']

      // Act
      const result = JSON.parse(response.body)?.richnessBySite

      // Assert - property exists & correct type
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      const res = result as RichnessSiteData[]
      expect(res.length).toBe(3)

      // Assert - first result is object
      const testedSite = result.find((site: RichnessSiteData) => site.locationSiteId === locationSiteId)
      expect(testedSite).toBeTypeOf('object')
      const site = testedSite as Record<string, any>

      // Assert - first result contains (only) expected props
      siteExpectedProperties.forEach(expectedProperty => expect(site).toHaveProperty(expectedProperty))
      Object.keys(site).forEach(actualProperty => expect(siteExpectedProperties).toContain(actualProperty))

      // Assert - locationSiteId, richness, taxonClassId
      expect(site.locationSiteId).toBe(locationSiteId)
      expect(site.richness).toBe(richness)
      expect(site.taxonClassId).toBe(taxonClassId)
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
        url: richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
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
        url: richnessDatasetUrl({ projectId: PROJECT_ID_BASIC }),
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
