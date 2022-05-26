import { describe, expect, test } from 'vitest'

import { DetectedSpecies, RichnessDatasetResponse, richnessDatasetUrl, RichnessSiteData } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { describeDatasetApiRejectsInvalidRequests } from '@/_testing/describe-dataset-api-rejects-invalid-requests'
import { describeDatasetApiReturnsValidResponse } from '@/_testing/describe-dataset-api-returns-valid-response'
import { getInjectAsInvalidToken, getInjectAsLoggedInNotProjectMember, getInjectAsLoggedInProjectMember, getInjectAsLoggedOut, getMockedFastify } from '@/_testing/get-inject'
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
  'detectedSpecies'
]

const isObjectValueNumber = (obj: any): boolean => {
  return Object.values(obj).every(o => typeof o === 'number')
}

const PROJECT_ID_BASIC = '10001'
const PROJECT_ID_NO_DETECTIONS = '10003'
const PROJECT_ID_TIME_BUCKET = '10005'
const PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON = '10006'
const PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET = '10007'
const PROJECT_ID_DETECTED_SPECIES = '10008'
const PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES = '10009'

describe(`GET ${ROUTE} (richness dataset)`, async () => {
  const routes = routesRichness
  const injectAsLoggedInProjectMember = await getInjectAsLoggedInProjectMember(routes)
  const injectAsLoggedInNotProjectMember = await getInjectAsLoggedInNotProjectMember(routes)
  const injectAsLoggedOut = await getInjectAsLoggedOut(routes)
  const injectAsInvalidToken = await getInjectAsInvalidToken(routes)
  const method = GET

  test('exists', async () => {
    // Arrange
    const app = await getMockedFastify({ routes })

    // Act
    const routeList = app.printRoutes()

    // Assert
    expect(routeList).toContain(ROUTE)
  })

  describe.each([
    ['logged-in-project-member', injectAsLoggedInProjectMember],
    ['logged-in-not-project-member', injectAsLoggedInNotProjectMember],
    ['logged-out', injectAsLoggedOut]
  ])('as %s', (_, inject) => {
    describeDatasetApiReturnsValidResponse(inject, richnessDatasetUrl, EXPECTED_PROPS, PROJECT_ID_BASIC)
    describeDatasetApiRejectsInvalidRequests(inject, richnessDatasetUrl)

    describe('richnessByTaxon', () => {
      test('richnessByTaxon are present if no sites filter', async () => {
        // Arrange
        const allTaxonIds = ['100', '300', '600']

        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')
        expect(Object.keys(richnessByTaxon).every(taxonId => allTaxonIds.includes(taxonId))).toBeTruthy()
      })

      test('richnessByTaxon in filter are present & no more', async () => {
        // Arrange
        const taxonIdsToBeFilter = ['100', '300']

        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', taxons: taxonIdsToBeFilter }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')
        expect(Object.keys(richnessByTaxon).every(taxonId => taxonIdsToBeFilter.includes(taxonId))).toBeTruthy()
      })

      test('richnessByTaxon is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 100: 1, 300: 2, 600: 1 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10001001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 100: 1, 600: 1 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: ['10001002', '10001097'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 300: 2 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: '600' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 600: 1 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['300', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 300: 2, 600: 1 })
      })
    })

    describe('richnessBySite', () => {
      test('richnessBySite are present if no sites filter', async () => {
        const allSiteIds = ['10001001', '10001002']
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)
        const mappedSiteIds = richnessBySite.map((site: RichnessSiteData) => site.locationSiteId.toString())
        expect(mappedSiteIds.every((siteId: string) => allSiteIds.includes(siteId))).toBeTruthy()
      })

      test('richnessBySite in filter are present & no more', async () => {
        // Act
        const siteIdsToBeFilter = ['10001001', '10001002']
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: siteIdsToBeFilter }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)
        const mappedSiteIds = richnessBySite.map((site: RichnessSiteData) => site.locationSiteId.toString())
        expect(mappedSiteIds.every((siteId: string) => siteIdsToBeFilter.includes(siteId))).toBeTruthy()
      })

      test('richnessBySite is return expected properties', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Arrange
        const siteExpectedProperties = ['locationSiteId', 'richness', 'taxonClassId']

        expect(response.statusCode, response.body).toBe(200)

        // Assert - property exists & correct type
        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)

        // Assert - first result is object
        const testedSite = richnessBySite.find((site: RichnessSiteData) => site.locationSiteId === 10001001)
        expect(testedSite).toBeTypeOf('object')
        const site = testedSite as Record<string, any>

        // Assert - first result contains (only) expected props
        siteExpectedProperties.forEach(expectedProperty => expect(site).toHaveProperty(expectedProperty))
        Object.keys(site).forEach(actualProperty => expect(siteExpectedProperties).toContain(actualProperty))
      })

      test('richnessBySite is calculate correctly on given date', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)
        expect(richnessBySite.length).toBe(3)
        const taxonClass1 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const taxonClass2 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 300)
        const taxonClass3 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(taxonClass1.richness).toBe(1)
        expect(taxonClass2.richness).toBe(2)
        expect(taxonClass3.richness).toBe(1)
      })

      test('richnessBySite is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10001001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(2)
        richnessBySite.forEach((site: RichnessSiteData) => expect(site.locationSiteId).toBe(10001001))
        const taxonClass1 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const taxonClass2 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(taxonClass1?.richness).toBe(1)
        expect(taxonClass2?.richness).toBe(1)
      })

      test('richnessBySite is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: ['10001001', '10001002'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(3)

        // Assert - correct contain taxon class on different site
        const siteData1 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10001001)
        const siteData2 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10001002)
        expect(siteData1.map((site: RichnessSiteData) => site.taxonClassId)).not.contain(300)
        expect(siteData2.map((site: RichnessSiteData) => site.taxonClassId)).not.contain(100)
        expect(siteData2.map((site: RichnessSiteData) => site.taxonClassId)).not.toContain(600)

        // Assert - correct contain taxon class value on different site
        const taxonClass1 = siteData1.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const taxonClass2 = siteData1.find((site: RichnessSiteData) => site.taxonClassId === 600)
        const taxonClass3 = siteData2.find((site: RichnessSiteData) => site.taxonClassId === 300)
        expect(taxonClass1?.richness).toBe(1)
        expect(taxonClass2?.richness).toBe(1)
        expect(taxonClass3?.richness).toBe(2)
      })

      test('richnessBySite is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: '600' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(1)
        expect(richnessBySite[0].taxonClassId).toBe(600)
        expect(richnessBySite[0].richness).toBe(1)
      })

      test('richnessBySite is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['300', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(2)
        const siteData1 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 300)
        const siteData2 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 600)

        expect(siteData1?.richness).toBe(2)
        expect(siteData1?.locationSiteId).toBe(10001002)
        expect(siteData2?.richness).toBe(1)
        expect(siteData2?.locationSiteId).toBe(10001001)
      })
    })

    describe('richnessByTimeHourOfDay', () => {
      test('All hours of day (0-23) are present', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')
        const expectedHourOfDay = [...Array(24).keys()].map(String)
        const actualHourOfDay = Object.keys(richnessByTimeHourOfDay)
        expect(actualHourOfDay).toHaveLength(24)
        expect(actualHourOfDay).toEqual(expectedHourOfDay)
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 2, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 2, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 2 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10005001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10005002', '10005003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 2, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 1, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 1, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1 })
      })
    })

    describe('richnessByTimeDayOfWeek', () => {
      test('All day of week (0-6) are present', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')
        const expectedDayOfWeek = [...Array(7).keys()].map(String)
        const actualDayOfWeek = Object.keys(richnessByTimeDayOfWeek)
        expect(actualDayOfWeek).toHaveLength(7)
        expect(actualDayOfWeek).toEqual(expectedDayOfWeek)
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 2, 5: 1, 6: 2 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10005001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 1 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10005002', '10005003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 2, 5: 0, 6: 1 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 1, 5: 0, 6: 1 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1 })
      })
    })

    describe('richnessByTimeMonthOfYear', () => {
      test('All month of year (0-11) are present', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')
        const expectedMonthOfYear = [...Array(12).keys()].map(String)
        const actualMonthOfYear = Object.keys(richnessByTimeMonthOfYear)
        expect(actualMonthOfYear).toHaveLength(12)
        expect(actualMonthOfYear).toEqual(expectedMonthOfYear)
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 3, 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 1 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10005001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 1 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10005002', '10005003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 2, 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 2, 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 1, 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 1 })
      })
    })

    describe('richnessByTimeUnix', () => {
      test('richnessByTimeUnix is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 1, 1640995200: 1, 1641081600: 1, 1641600000: 1, 1645056000: 2 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10005001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 1, 1640995200: 1 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10005002', '10005003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1641081600: 1, 1641600000: 1, 1645056000: 2 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1641081600: 1, 1641600000: 1, 1645056000: 1 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 1, 1640995200: 1, 1645056000: 1 })
      })
    })

    describe('detectedSpecies', () => {
      test('detectedSpecies is return expected properties', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Arrange
        const detectedSpeciesExpectedProperties = ['taxonClassId', 'taxonSpeciesId', 'taxonSpeciesSlug', 'commonName', 'scientificName']

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies.length).toBeGreaterThan(0)

        const speciesSample = detectedSpecies[0]
        expect(speciesSample).toBeTypeOf('object')
        detectedSpeciesExpectedProperties.forEach(expectedProperty => expect(speciesSample).toHaveProperty(expectedProperty))
        Object.keys(speciesSample).forEach(actualProperty => expect(detectedSpeciesExpectedProperties).toContain(actualProperty))
      })

      test('detectedSpecies is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(5)
        const expectedSpeciesIds = [1, 2, 3, 4, 7]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10008001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(2)
        const expectedSpeciesIds = [1, 7]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: ['10008002', '10008003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(3)
        const expectedSpeciesIds = [2, 3, 4]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(2)
        const expectedSpeciesIds = [3, 4]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(2)
        const expectedSpeciesIds = [1, 2]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })
    })
  })

  describe.each([
    ['logged-in-not-project-member', injectAsLoggedInNotProjectMember],
    ['logged-out', injectAsLoggedOut],
    ['invalid-token-user', injectAsInvalidToken]
  ])('critically endangered species redacted for non-project-members', (label, inject) => {
    test(`isLocationRedacted should be true if ${label}`, async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await inject({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
      expect(result.isLocationRedacted).toBeTruthy()
    })

    describe('richnessByTaxon', () => {
      test('richnessByTaxon are present if no sites filter', async () => {
        // Arrange
        const allTaxonWithoutProtectedTaxonIds = ['100', '500', '600']

        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')
        expect(Object.keys(richnessByTaxon).every(taxonId => allTaxonWithoutProtectedTaxonIds.includes(taxonId))).toBeTruthy()
      })

      test('richnessByTaxon in filter are present & no more', async () => {
        // Arrange
        const taxonIdsToBeFilter = ['100', '300']
        const expectedTaxonIds = ['100']

        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', taxons: taxonIdsToBeFilter }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')
        expect(Object.keys(richnessByTaxon).every(taxonId => expectedTaxonIds.includes(taxonId))).toBeTruthy()
      })

      test('richnessByTaxon is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 100: 2, 500: 1, 600: 1 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10006001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 100: 1, 600: 1 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: ['10006002', '10006003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 100: 1, 500: 1, 600: 1 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: '600' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 600: 1 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['300', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 600: 1 })
      })
    })

    describe('richnessBySite', () => {
      test('richnessBySite are present if no sites filter', async () => {
        const allSiteIds = ['10006001', '10006002', '10006003']
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)
        const mappedSiteIds = richnessBySite.map((site: RichnessSiteData) => site.locationSiteId.toString())
        expect(mappedSiteIds.every((siteId: string) => allSiteIds.includes(siteId))).toBeTruthy()
      })

      test('richnessBySite in filter are present & no more', async () => {
        // Act
        const siteIdsToBeFilter = ['10006001', '10006003']
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: siteIdsToBeFilter }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)
        const mappedSiteIds = richnessBySite.map((site: RichnessSiteData) => site.locationSiteId.toString())
        expect(mappedSiteIds.every((siteId: string) => siteIdsToBeFilter.includes(siteId))).toBeTruthy()
      })

      test('richnessBySite is return expected properties', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Arrange
        const siteExpectedProperties = ['locationSiteId', 'richness', 'taxonClassId']

        expect(response.statusCode, response.body).toBe(200)

        // Assert - property exists & correct type
        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)

        // Assert - first result is object
        const testedSite = richnessBySite.find((site: RichnessSiteData) => site.locationSiteId === 10006001)
        expect(testedSite).toBeTypeOf('object')
        const site = testedSite as Record<string, any>

        // Assert - first result contains (only) expected props
        siteExpectedProperties.forEach(expectedProperty => expect(site).toHaveProperty(expectedProperty))
        Object.keys(site).forEach(actualProperty => expect(siteExpectedProperties).toContain(actualProperty))
      })

      test('richnessBySite is calculate correctly on given date', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)
        expect(richnessBySite.length).toBe(9)

        const richnessBySite1 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006001)
        expect(richnessBySite1.length).toBe(3)
        const site1TaxonClass1 = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const site1TaxonClass2 = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site1TaxonClass1.richness).toBe(1)
        expect(site1TaxonClass2.richness).toBe(1)

        const richnessBySite2 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006002)
        expect(richnessBySite2.length).toBe(4)
        const site2TaxonClass1 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const site2TaxonClass2 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 500)
        const site2TaxonClass3 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site2TaxonClass1.richness).toBe(1)
        expect(site2TaxonClass2.richness).toBe(1)
        expect(site2TaxonClass3.richness).toBe(1)

        const richnessBySite3 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006003)
        expect(richnessBySite3.length).toBe(2)
        const site3TaxonClass1 = richnessBySite3.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const site3TaxonClass2 = richnessBySite3.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site3TaxonClass1.richness).toBe(1)
        expect(site3TaxonClass2.richness).toBe(1)
      })

      test('richnessBySite is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10006001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(3)
        richnessBySite.forEach((site: RichnessSiteData) => expect(site.locationSiteId).toBe(10006001))
        const taxonClass1 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const taxonClass2 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(taxonClass1.richness).toBe(1)
        expect(taxonClass2.richness).toBe(1)
      })

      test('richnessBySite is calculate correctly on given date filter by sites', async () => {
        // Arrange
        const siteIdsToBeFilter = ['10006001', '10006003']

        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: siteIdsToBeFilter }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(5)

        richnessBySite.forEach((site: RichnessSiteData) => expect(siteIdsToBeFilter.includes(site.locationSiteId.toString())).toBeTruthy())

        const richnessBySite1 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006001)
        expect(richnessBySite1.length).toBe(3)
        const site1TaxonClass1 = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const site1TaxonClass2 = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site1TaxonClass1.richness).toBe(1)
        expect(site1TaxonClass2.richness).toBe(1)

        const richnessBySite2 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006003)
        expect(richnessBySite2.length).toBe(2)
        const site2TaxonClass1 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const site2TaxonClass2 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site2TaxonClass1.richness).toBe(1)
        expect(site2TaxonClass2.richness).toBe(1)
      })

      test('richnessBySite is calculate correctly on given date filter by taxon', async () => {
        // Arrange
        const taxonIdToBeFilter = '600'

        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: taxonIdToBeFilter }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(3)
        richnessBySite.forEach((site: RichnessSiteData) => expect(site.taxonClassId.toString() === taxonIdToBeFilter).toBeTruthy())

        const richnessBySite1 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006001)
        const site1TaxonClass = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site1TaxonClass.richness).toBe(1)

        const richnessBySite2 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006002)
        const site2TaxonClass = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site2TaxonClass.richness).toBe(1)

        const richnessBySite3 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006003)
        const site3TaxonClass = richnessBySite3.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site3TaxonClass.richness).toBe(1)
      })

      test('richnessBySite is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['300', '500'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(3)
        const richnessBySite1 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006001)
        expect(richnessBySite1.length).toBe(0)

        const richnessBySite2 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006002)
        expect(richnessBySite2.every((site: RichnessSiteData) => site.taxonClassId !== 300))
        expect(richnessBySite2.length).toBe(1)
        const site2TaxonClass = richnessBySite2[0] // 500
        expect(site2TaxonClass.richness).toBe(1)
      })
    })

    describe('richnessByTimeHourOfDay', () => {
      test('All hours of day (0-23) are present', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')
        const expectedHourOfDay = [...Array(24).keys()].map(String)
        const actualHourOfDay = Object.keys(richnessByTimeHourOfDay)
        expect(actualHourOfDay).toHaveLength(24)
        expect(actualHourOfDay).toEqual(expectedHourOfDay)
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 2, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 3, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 3 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10007001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 2, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 2 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10007002', '10007003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 2, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 3, 12: 0, 13: 0, 14: 0, 15: 1, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 3 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 2, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 2 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 1, 12: 0, 13: 0, 14: 0, 15: 1, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1 })
      })
    })

    describe('richnessByTimeDayOfWeek', () => {
      test('All day of week (0-6) are present', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')
        const expectedDayOfWeek = [...Array(7).keys()].map(String)
        const actualDayOfWeek = Object.keys(richnessByTimeDayOfWeek)
        expect(actualDayOfWeek).toHaveLength(7)
        expect(actualDayOfWeek).toEqual(expectedDayOfWeek)
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 3, 1: 0, 2: 3, 3: 0, 4: 0, 5: 2, 6: 0 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10007001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 2, 1: 0, 2: 2, 3: 0, 4: 0, 5: 1, 6: 0 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10007002', '10007003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 3, 1: 0, 2: 3, 3: 0, 4: 0, 5: 2, 6: 0 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 2, 1: 0, 2: 2, 3: 0, 4: 0, 5: 1, 6: 0 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 1, 1: 0, 2: 1, 3: 0, 4: 0, 5: 1, 6: 0 })
      })
    })

    describe('richnessByTimeMonthOfYear', () => {
      test('All month of year (0-11) are present', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')
        const expectedMonthOfYear = [...Array(12).keys()].map(String)
        const actualMonthOfYear = Object.keys(richnessByTimeMonthOfYear)
        expect(actualMonthOfYear).toHaveLength(12)
        expect(actualMonthOfYear).toEqual(expectedMonthOfYear)
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 2, 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 2 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10007001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 1, 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 1 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10007002', '10007003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 2, 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 2 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 2, 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 2 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 1, 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 1 })
      })
    })

    describe('richnessByTimeUnix', () => {
      test('richnessByTimeUnix is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 2, 1641081600: 2, 1644105600: 2, 1644710400: 2, 1644883200: 3 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10007001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 1, 1641081600: 1, 1644105600: 1, 1644710400: 1, 1644883200: 2 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10007002', '10007003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 2, 1641081600: 2, 1644105600: 2, 1644710400: 2, 1644883200: 3 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 1, 1641081600: 1, 1644105600: 1, 1644710400: 1, 1644883200: 2 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 1, 1641081600: 1, 1644105600: 1, 1644710400: 1, 1644883200: 1 })
      })
    })

    describe('detectedSpecies', () => {
      test('detectedSpecies is return expected properties', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Arrange
        const detectedSpeciesExpectedProperties = ['taxonClassId', 'taxonSpeciesId', 'taxonSpeciesSlug', 'commonName', 'scientificName']

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies.length).toBeGreaterThan(0)

        const speciesSample = detectedSpecies[0]
        expect(speciesSample).toBeTypeOf('object')
        detectedSpeciesExpectedProperties.forEach(expectedProperty => expect(speciesSample).toHaveProperty(expectedProperty))
        Object.keys(speciesSample).forEach(actualProperty => expect(detectedSpeciesExpectedProperties).toContain(actualProperty))
      })

      test('detectedSpecies is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(5)
        const expectedSpeciesIds = [1, 2, 3, 4, 7]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10009001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(2)
        const expectedSpeciesIds = [1, 7]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: ['10009002', '10009003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(2)
        const expectedSpeciesIds = [3, 4]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(2)
        const expectedSpeciesIds = [3, 4]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(2)
        const expectedSpeciesIds = [1, 2]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })
    })
  })

  describe('critically endangered species NOT redacted for project-members', () => {
    test('isLocationRedacted should be false if logged in as project member', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await injectAsLoggedInProjectMember({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
      expect(result.isLocationRedacted).toBeFalsy()
    })

    describe('richnessByTaxon', () => {
      test('richnessByTaxon are present if no sites filter', async () => {
        // Arrange
        const allTaxonIds = ['100', '300', '500', '600']

        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')
        expect(Object.keys(richnessByTaxon).every(taxonId => allTaxonIds.includes(taxonId))).toBeTruthy()
      })

      test('richnessByTaxon in filter are present & no more', async () => {
        // Arrange
        const taxonIdsToBeFilter = ['100', '300']

        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', taxons: taxonIdsToBeFilter }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')
        expect(Object.keys(richnessByTaxon).every(taxonId => taxonIdsToBeFilter.includes(taxonId))).toBeTruthy()
      })

      test('richnessByTaxon is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 100: 2, 300: 1, 500: 1, 600: 2 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10006001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 100: 1, 300: 1, 600: 2 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: ['10006002', '10006003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 100: 2, 300: 1, 500: 1, 600: 2 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: '600' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 600: 2 })
      })

      test('richnessByTaxon is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['300', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTaxon } = response.json()
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 300: 1, 600: 2 })
      })
    })

    describe('richnessBySite', () => {
      test('richnessBySite are present if no sites filter', async () => {
        const allSiteIds = ['10006001', '10006002', '10006003']
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)
        const mappedSiteIds = richnessBySite.map((site: RichnessSiteData) => site.locationSiteId.toString())
        expect(mappedSiteIds.every((siteId: string) => allSiteIds.includes(siteId))).toBeTruthy()
      })

      test('richnessBySite in filter are present & no more', async () => {
        // Act
        const siteIdsToBeFilter = ['10006001', '10006003']
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: siteIdsToBeFilter }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)
        const mappedSiteIds = richnessBySite.map((site: RichnessSiteData) => site.locationSiteId.toString())
        expect(mappedSiteIds.every((siteId: string) => siteIdsToBeFilter.includes(siteId))).toBeTruthy()
      })

      test('richnessBySite is return expected properties', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Arrange
        const siteExpectedProperties = ['locationSiteId', 'richness', 'taxonClassId']

        expect(response.statusCode, response.body).toBe(200)

        // Assert - property exists & correct type
        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)

        // Assert - first result is object
        const testedSite = richnessBySite.find((site: RichnessSiteData) => site.locationSiteId === 10006001)
        expect(testedSite).toBeTypeOf('object')
        const site = testedSite as Record<string, any>

        // Assert - first result contains (only) expected props
        siteExpectedProperties.forEach(expectedProperty => expect(site).toHaveProperty(expectedProperty))
        Object.keys(site).forEach(actualProperty => expect(siteExpectedProperties).toContain(actualProperty))
      })

      test('richnessBySite is calculate correctly on given date', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)
        expect(richnessBySite.length).toBe(9)

        const richnessBySite1 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006001)
        expect(richnessBySite1.length).toBe(3)
        const site1TaxonClass1 = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const site1TaxonClass2 = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 300)
        const site1TaxonClass3 = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site1TaxonClass1.richness).toBe(1)
        expect(site1TaxonClass2.richness).toBe(1)
        expect(site1TaxonClass3.richness).toBe(2)

        const richnessBySite2 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006002)
        expect(richnessBySite2.length).toBe(4)
        const site2TaxonClass1 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const site2TaxonClass2 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 300)
        const site2TaxonClass3 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 500)
        const site2TaxonClass4 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site2TaxonClass1.richness).toBe(1)
        expect(site2TaxonClass2.richness).toBe(1)
        expect(site2TaxonClass3.richness).toBe(1)
        expect(site2TaxonClass4.richness).toBe(2)

        const richnessBySite3 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006003)
        expect(richnessBySite3.length).toBe(2)
        const site3TaxonClass1 = richnessBySite3.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const site3TaxonClass2 = richnessBySite3.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site3TaxonClass1.richness).toBe(1)
        expect(site3TaxonClass2.richness).toBe(2)
      })

      test('richnessBySite is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10006001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(3)
        richnessBySite.forEach((site: RichnessSiteData) => expect(site.locationSiteId).toBe(10006001))
        const taxonClass1 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const taxonClass2 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 300)
        const taxonClass3 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(taxonClass1?.richness).toBe(1)
        expect(taxonClass2?.richness).toBe(1)
        expect(taxonClass3?.richness).toBe(2)
      })

      test('richnessBySite is calculate correctly on given date filter by sites', async () => {
        // Arrange
        const siteIdsToBeFilter = ['10006001', '10006003']

        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: siteIdsToBeFilter }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(5)

        richnessBySite.forEach((site: RichnessSiteData) => expect(siteIdsToBeFilter.includes(site.locationSiteId.toString())).toBeTruthy())

        const richnessBySite1 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006001)
        expect(richnessBySite1.length).toBe(3)
        const site1TaxonClass1 = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const site1TaxonClass2 = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 300)
        const site1TaxonClass3 = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site1TaxonClass1.richness).toBe(1)
        expect(site1TaxonClass2.richness).toBe(1)
        expect(site1TaxonClass3.richness).toBe(2)

        const richnessBySite2 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006003)
        expect(richnessBySite2.length).toBe(2)
        const site2TaxonClass1 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const site2TaxonClass2 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site2TaxonClass1.richness).toBe(1)
        expect(site2TaxonClass2.richness).toBe(2)
      })

      test('richnessBySite is calculate correctly on given date filter by taxon', async () => {
        // Arrange
        const taxonIdToBeFilter = '600'

        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: taxonIdToBeFilter }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(3)
        richnessBySite.forEach((site: RichnessSiteData) => expect(site.taxonClassId.toString() === taxonIdToBeFilter).toBeTruthy())

        const richnessBySite1 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006001)
        const site1TaxonClass = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site1TaxonClass.richness).toBe(2)

        const richnessBySite2 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006002)
        const site2TaxonClass = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site2TaxonClass.richness).toBe(2)

        const richnessBySite3 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006003)
        const site3TaxonClass = richnessBySite3.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(site3TaxonClass.richness).toBe(2)
      })

      test('richnessBySite is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_SITE_AND_TAXON })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['300', '500'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessBySite } = response.json()
        expect(richnessBySite.length).toBe(3)
        const richnessBySite1 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006001)
        const site1TaxonClass = richnessBySite1.find((site: RichnessSiteData) => site.taxonClassId === 300)
        expect(site1TaxonClass.richness).toBe(1)

        const richnessBySite2 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10006002)
        const site2TaxonClass1 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 300)
        const site2TaxonClass2 = richnessBySite2.find((site: RichnessSiteData) => site.taxonClassId === 500)
        expect(site2TaxonClass1.richness).toBe(1)
        expect(site2TaxonClass2.richness).toBe(1)
      })
    })

    describe('richnessByTimeHourOfDay', () => {
      test('All hours of day (0-23) are present', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')
        const expectedHourOfDay = [...Array(24).keys()].map(String)
        const actualHourOfDay = Object.keys(richnessByTimeHourOfDay)
        expect(actualHourOfDay).toHaveLength(24)
        expect(actualHourOfDay).toEqual(expectedHourOfDay)
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 4, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 5, 12: 0, 13: 0, 14: 0, 15: 1, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 4 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10007001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 2, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 3, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 3 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10007002', '10007003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 4, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 5, 12: 0, 13: 0, 14: 0, 15: 1, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 4 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 2, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 3, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 3 })
      })

      test('richnessByTimeHourOfDay is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeHourOfDay } = response.json()
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 2, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 2, 12: 0, 13: 0, 14: 0, 15: 1, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1 })
      })
    })

    describe('richnessByTimeDayOfWeek', () => {
      test('All day of week (0-6) are present', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')
        const expectedDayOfWeek = [...Array(7).keys()].map(String)
        const actualDayOfWeek = Object.keys(richnessByTimeDayOfWeek)
        expect(actualDayOfWeek).toHaveLength(7)
        expect(actualDayOfWeek).toEqual(expectedDayOfWeek)
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 5, 1: 1, 2: 5, 3: 0, 4: 0, 5: 3, 6: 1 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10007001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 3, 1: 0, 2: 3, 3: 0, 4: 0, 5: 2, 6: 0 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10007002', '10007003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 5, 1: 1, 2: 5, 3: 0, 4: 0, 5: 3, 6: 1 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 3, 1: 0, 2: 3, 3: 0, 4: 0, 5: 2, 6: 0 })
      })

      test('richnessByTimeDayOfWeek is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeDayOfWeek } = response.json()
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 2, 1: 1, 2: 2, 3: 0, 4: 0, 5: 1, 6: 1 })
      })
    })

    describe('richnessByTimeMonthOfYear', () => {
      test('All month of year (0-11) are present', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')
        const expectedMonthOfYear = [...Array(12).keys()].map(String)
        const actualMonthOfYear = Object.keys(richnessByTimeMonthOfYear)
        expect(actualMonthOfYear).toHaveLength(12)
        expect(actualMonthOfYear).toEqual(expectedMonthOfYear)
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 5, 1: 5, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 3 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10007001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 2, 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 2 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10007002', '10007003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 5, 1: 5, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 3 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 2, 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 2 })
      })

      test('richnessByTimeMonthOfYear is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeMonthOfYear } = response.json()
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 3, 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 1 })
      })
    })

    describe('richnessByTimeUnix', () => {
      test('richnessByTimeUnix is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 3, 1640995200: 1, 1641081600: 3, 1641168000: 1, 1644105600: 3, 1644710400: 4, 1644883200: 5 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10007001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 2, 1641081600: 2, 1644105600: 2, 1644710400: 2, 1644883200: 3 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10007002', '10007003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 3, 1640995200: 1, 1641081600: 3, 1641168000: 1, 1644105600: 3, 1644710400: 4, 1644883200: 5 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 2, 1641081600: 2, 1644105600: 2, 1644710400: 2, 1644883200: 3 })
      })

      test('richnessByTimeUnix is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_TIME_BUCKET })
        const response = await injectAsLoggedInProjectMember({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { richnessByTimeUnix } = response.json()
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 1, 1640995200: 1, 1641081600: 1, 1641168000: 1, 1644105600: 1, 1644710400: 2, 1644883200: 2 })
      })
    })

    describe('detectedSpecies', () => {
      test('detectedSpecies is return expected properties', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Arrange
        const detectedSpeciesExpectedProperties = ['taxonClassId', 'taxonSpeciesId', 'taxonSpeciesSlug', 'commonName', 'scientificName']

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies.length).toBeGreaterThan(0)

        const speciesSample = detectedSpecies[0]
        expect(speciesSample).toBeTypeOf('object')
        detectedSpeciesExpectedProperties.forEach(expectedProperty => expect(speciesSample).toHaveProperty(expectedProperty))
        Object.keys(speciesSample).forEach(actualProperty => expect(detectedSpeciesExpectedProperties).toContain(actualProperty))
      })

      test('detectedSpecies is calculate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(8)
        const expectedSpeciesIds = [1, 2, 3, 4, 5, 6, 7, 8]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10009001' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(4)
        const expectedSpeciesIds = [1, 5, 6, 7]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: ['10009002', '10009003'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(3)
        const expectedSpeciesIds = [3, 4, 8]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: '300' }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(3)
        const expectedSpeciesIds = [3, 4, 8]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })

      test('detectedSpecies is calculate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_PROTECTED_SPECIES_FOR_DETECTED_SPECIES })
        const response = await injectAsLoggedInProjectMember({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        expect(response.statusCode, response.body).toBe(200)

        const { detectedSpecies } = response.json()
        expect(detectedSpecies).toBeDefined()
        expect(Array.isArray(detectedSpecies)).toBe(true)
        expect(detectedSpecies).toHaveLength(4)
        const expectedSpeciesIds = [1, 2, 5, 6]
        const actualSpeciesIds = detectedSpecies.map((d: DetectedSpecies) => d.taxonSpeciesId)
        expect(actualSpeciesIds).toEqual(expectedSpeciesIds)
      })
    })
  })

  describe.each([
    ['logged-in-project-member', injectAsLoggedInProjectMember],
    ['logged-in-not-project-member', injectAsLoggedInNotProjectMember],
    ['logged-out', injectAsLoggedOut]
  ])('check empty value cases', (_, inject) => {
    const expectedEmptyResult = (result: RichnessDatasetResponse): void => {
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
      expect(result.richnessBySite).toEqual([])
      expect(result.richnessByTaxon).toEqual({})
      expect(result.richnessByTimeHourOfDay).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0 })
      expect(result.richnessByTimeDayOfWeek).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 })
      expect(result.richnessByTimeMonthOfYear).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 })
      expect(result.richnessByTimeUnix).toEqual({})
      expect(result.detectedSpecies).toEqual({})
    }

    const expectedRichnessByTimeValueAreNumber = (result: RichnessDatasetResponse): void => {
      expect(isObjectValueNumber(result.richnessByTimeHourOfDay)).toBe(true)
      expect(isObjectValueNumber(result.richnessByTimeDayOfWeek)).toBe(true)
      expect(isObjectValueNumber(result.richnessByTimeMonthOfYear)).toBe(true)
      expect(isObjectValueNumber(result.richnessByTimeUnix)).toBe(true)
    }

    test('does not have any data on empty project', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_NO_DETECTIONS })
      const response = await inject({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })

    test('does not have any data on given date', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await inject({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2002-01-01T00:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })

    test('does not have any data on specific site', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await inject({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', siteIds: '10001010' }
      })

      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })

    test('does not have any data on specific sites', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await inject({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', siteIds: ['10001010', '10001011'] }
      })

      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })

    test('does not have any data on specific taxon', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await inject({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', taxons: '400' }
      })

      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })

    test('does not have any data on specific taxons', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await inject({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', taxons: ['400', '500'] }
      })

      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })
  })
})
