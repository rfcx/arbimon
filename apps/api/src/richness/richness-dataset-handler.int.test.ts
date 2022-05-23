import { HTTPMethods } from 'fastify'
import { describe, expect, test } from 'vitest'

import { RichnessDatasetResponse, richnessDatasetUrl, RichnessSiteData } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

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
  'detectedSpecies'
]

const isObjectValueNumber = (obj: any): boolean => {
  return Object.values(obj).every(o => typeof o === 'number')
}

const PROJECT_ID_BASIC = '10001'
const PROJECT_ID_NO_DETECTIONS = '10003'
const PROJECT_ID_TIME_BUCKET = '10005'

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
    { label: 'logged-in-project-member', inject: injectAsLoggedInProjectMember },
    // { label: 'logged-in-not-project-member', inject: injectAsLoggedInNotProjectMember },
    // { label: 'logged-out', inject: injectAsLoggedOut }
  ])('as %s', ({ inject }) => {
    describe('basic', () => {
      test('returns successfully', async () => {
        // Arrange
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const options: InjectOptions = {
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        }

        // Act
        const response = await inject(options)

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
      })

      test('contains all expected props & no more', async () => {
        // Act
        const response = await inject({
          method,
          url: richnessDatasetUrl({ projectId: PROJECT_ID_BASIC }),
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
        })

        // Assert
        const result = JSON.parse(response.body)
        EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
        expect(Object.keys(result).length).toBe(EXPECTED_PROPS.length)
      })
    })

    describe('richnessByTaxon', () => {
      test('richnessByTaxon is calcurate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        })

        // Assert
        const richnessByTaxon = JSON.parse(response.body).richnessByTaxon
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 100: 1, 300: 2, 600: 1 })
      })
      test('richnessByTaxon is calcurate correctly data on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10001001' }
        })

        // Assert
        const richnessByTaxon = JSON.parse(response.body).richnessByTaxon
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 100: 1, 600: 1 })
      })
      test('richnessByTaxon is calcurate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: ['10001002', '10001097'] }
        })

        // Assert
        const richnessByTaxon = JSON.parse(response.body).richnessByTaxon
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 300: 2 })
      })
      test('richnessByTaxon is calcurate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: '600' }
        })

        // Assert
        const richnessByTaxon = JSON.parse(response.body).richnessByTaxon
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 600: 1 })
      })
      test('richnessByTaxon is calcurate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['300', '600'] }
        })

        // Assert
        const richnessByTaxon = JSON.parse(response.body).richnessByTaxon
        expect(richnessByTaxon).toBeDefined()
        expect(richnessByTaxon).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTaxon)).toBeTruthy()
        expect(richnessByTaxon).toEqual({ 300: 2, 600: 1 })
      })
    })

    describe('richnessBySite', () => {
      test('richnessBySite is calcurate correctly on given date', async () => {
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Arrange
        const siteExpectedProperties = ['locationSiteId', 'richness', 'taxonClassId']

        // Assert - property exists & correct type
        const richnessBySite = JSON.parse(response.body)?.richnessBySite as RichnessSiteData[]
        expect(richnessBySite).toBeDefined()
        expect(Array.isArray(richnessBySite)).toBe(true)
        expect(richnessBySite.length).toBe(3)

        // Assert - first result is object
        const testedSite = richnessBySite.find((site: RichnessSiteData) => site.locationSiteId === 10001001)
        expect(testedSite).toBeTypeOf('object')
        const site = testedSite as Record<string, any>

        // Assert - first result contains (only) expected props
        siteExpectedProperties.forEach(expectedProperty => expect(site).toHaveProperty(expectedProperty))
        Object.keys(site).forEach(actualProperty => expect(siteExpectedProperties).toContain(actualProperty))
      })
      test('richnessBySite is calcurate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10001001' }
        })

        // Assert
        const richnessBySite = JSON.parse(response.body)?.richnessBySite as RichnessSiteData[]
        expect(richnessBySite.length).toBe(2)
        richnessBySite.forEach((site: RichnessSiteData) => expect(site.locationSiteId).toBe(10001001))
        const taxonClass1 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const taxonClass2 = richnessBySite.find((site: RichnessSiteData) => site.taxonClassId === 600)
        expect(taxonClass1?.richness).toBe(1)
        expect(taxonClass2?.richness).toBe(1)
      })
      test('richnessBySite is calcurate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: ['10001001', '10001002'] }
        })

        // Assert
        const richnessBySite = JSON.parse(response.body)?.richnessBySite as RichnessSiteData[]
        expect(richnessBySite.length).toBe(3)

        // Assert - correct contain taxon class on different site
        const siteData1 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10001001)
        const siteData2 = richnessBySite.filter((site: RichnessSiteData) => site.locationSiteId === 10001002)
        expect(siteData1.map(s => s.taxonClassId)).not.contain(300)
        expect(siteData2.map(s => s.taxonClassId)).not.contain(100)
        expect(siteData2.map(s => s.taxonClassId)).not.toContain(600)

        // Assert - correct contain taxon class value on different site
        const taxonClass1 = siteData1.find((site: RichnessSiteData) => site.taxonClassId === 100)
        const taxonClass2 = siteData1.find((site: RichnessSiteData) => site.taxonClassId === 600)
        const taxonClass3 = siteData2.find((site: RichnessSiteData) => site.taxonClassId === 300)
        expect(taxonClass1?.richness).toBe(1)
        expect(taxonClass2?.richness).toBe(1)
        expect(taxonClass3?.richness).toBe(2)
      })
      test('richnessBySite is calcurate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: '600' }
        })

        // Assert
        const richnessBySite = JSON.parse(response.body)?.richnessBySite as RichnessSiteData[]
        expect(richnessBySite.length).toBe(1)
        expect(richnessBySite[0].taxonClassId).toBe(600)
        expect(richnessBySite[0].richness).toBe(1)
      })
      test('richnessBySite is calcurate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['300', '600'] }
        })

        // Assert
        const richnessBySite = JSON.parse(response.body)?.richnessBySite as RichnessSiteData[]
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
      test('richnessByTimeHourOfDay is calcurate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        const richnessByTimeHourOfDay = JSON.parse(response.body).richnessByTimeHourOfDay
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 2, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 2, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 2 })
      })
      test('richnessByTimeHourOfDay is calcurate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10005001' }
        })

        // Assert
        const richnessByTimeHourOfDay = JSON.parse(response.body).richnessByTimeHourOfDay
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1 })
      })
      test('richnessByTimeHourOfDay is calcurate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10005002', '10005003'] }
        })

        // Assert
        const richnessByTimeHourOfDay = JSON.parse(response.body).richnessByTimeHourOfDay
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 2, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1 })
      })
      test('richnessByTimeHourOfDay is calcurate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        const richnessByTimeHourOfDay = JSON.parse(response.body).richnessByTimeHourOfDay
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 1, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1 })
      })
      test('richnessByTimeHourOfDay is calcurate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        const richnessByTimeHourOfDay = JSON.parse(response.body).richnessByTimeHourOfDay
        expect(richnessByTimeHourOfDay).toBeDefined()
        expect(richnessByTimeHourOfDay).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeHourOfDay)).toBeTruthy()
        expect(richnessByTimeHourOfDay).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 1, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1 })
      })
    })

    describe('richnessByTimeDayOfWeek', () => {
      test('richnessByTimeDayOfWeek is calcurate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        const richnessByTimeDayOfWeek = JSON.parse(response.body).richnessByTimeDayOfWeek
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 2, 5: 1, 6: 2 })
      })
      test('richnessByTimeDayOfWeek is calcurate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10005001' }
        })

        // Assert
        const richnessByTimeDayOfWeek = JSON.parse(response.body).richnessByTimeDayOfWeek
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 1 })
      })
      test('richnessByTimeDayOfWeek is calcurate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10005002', '10005003'] }
        })

        // Assert
        const richnessByTimeDayOfWeek = JSON.parse(response.body).richnessByTimeDayOfWeek
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 2, 5: 0, 6: 1 })
      })
      test('richnessByTimeDayOfWeek is calcurate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        const richnessByTimeDayOfWeek = JSON.parse(response.body).richnessByTimeDayOfWeek
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 1, 5: 0, 6: 1 })
      })
      test('richnessByTimeDayOfWeek is calcurate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        const richnessByTimeDayOfWeek = JSON.parse(response.body).richnessByTimeDayOfWeek
        expect(richnessByTimeDayOfWeek).toBeDefined()
        expect(richnessByTimeDayOfWeek).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeDayOfWeek)).toBeTruthy()
        expect(richnessByTimeDayOfWeek).toEqual({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1 })
      })
    })

    describe('richnessByTimeMonthOfYear', () => {
      test('richnessByTimeMonthOfYear is calcurate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        const richnessByTimeMonthOfYear = JSON.parse(response.body).richnessByTimeMonthOfYear
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 3, 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 1 })
      })
      test('richnessByTimeMonthOfYear is calcurate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10005001' }
        })

        // Assert
        const richnessByTimeMonthOfYear = JSON.parse(response.body).richnessByTimeMonthOfYear
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 1 })
      })
      test('richnessByTimeMonthOfYear is calcurate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10005002', '10005003'] }
        })

        // Assert
        const richnessByTimeMonthOfYear = JSON.parse(response.body).richnessByTimeMonthOfYear
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 2, 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 })
      })
      test('richnessByTimeMonthOfYear is calcurate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        const richnessByTimeMonthOfYear = JSON.parse(response.body).richnessByTimeMonthOfYear
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 2, 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 })
      })
      test('richnessByTimeMonthOfYear is calcurate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        const richnessByTimeMonthOfYear = JSON.parse(response.body).richnessByTimeMonthOfYear
        expect(richnessByTimeMonthOfYear).toBeDefined()
        expect(richnessByTimeMonthOfYear).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeMonthOfYear)).toBeTruthy()
        expect(richnessByTimeMonthOfYear).toEqual({ 0: 1, 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 1 })
      })
    })

    describe('richnessByTimeUnix', () => {
      test('richnessByTimeUnix is calcurate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z' }
        })

        // Assert
        const richnessByTimeUnix = JSON.parse(response.body).richnessByTimeUnix
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 1, 1640995200: 1, 1641081600: 1, 1641600000: 1, 1645056000: 2 })
      })
      test('richnessByTimeUnix is calcurate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: '10005001' }
        })

        // Assert
        const richnessByTimeUnix = JSON.parse(response.body).richnessByTimeUnix
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 1, 1640995200: 1 })
      })
      test('richnessByTimeUnix is calcurate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', siteIds: ['10005002', '10005003'] }
        })

        // Assert
        const richnessByTimeUnix = JSON.parse(response.body).richnessByTimeUnix
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1641081600: 1, 1641600000: 1, 1645056000: 2 })
      })
      test('richnessByTimeUnix is calcurate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          method,
          url,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: '300' }
        })

        // Assert
        const richnessByTimeUnix = JSON.parse(response.body).richnessByTimeUnix
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1641081600: 1, 1641600000: 1, 1645056000: 1 })
      })
      test('richnessByTimeUnix is calcurate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_TIME_BUCKET })
        const response = await inject({
          url,
          method,
          query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2022-03-31T00:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        const richnessByTimeUnix = JSON.parse(response.body).richnessByTimeUnix
        expect(richnessByTimeUnix).toBeDefined()
        expect(richnessByTimeUnix).toBeTypeOf('object')

        expect(isObjectValueNumber(richnessByTimeUnix)).toBeTruthy()
        expect(richnessByTimeUnix).toEqual({ 1640908800: 1, 1640995200: 1, 1645056000: 1 })
      })
    })

    describe('detectedSpecies', () => {
      // TODO: Update richness presence test case after the query code updated
      test('detectedSpecies is calcurate correctly on given date', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z' }
        })

        // Assert
        const detectedSpecies = JSON.parse(response.body).detectedSpecies
        expect(detectedSpecies).toBeDefined()
        expect(detectedSpecies).toBeTypeOf('object')
      })
      test('detectedSpecies is calcurate correctly on given date filter by site', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: '10001001' }
        })

        // Assert
        const detectedSpecies = JSON.parse(response.body).detectedSpecies
        expect(detectedSpecies).toBeDefined()
        expect(detectedSpecies).toBeTypeOf('object')
      })
      test('detectedSpecies is calcurate correctly on given date filter by sites', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', siteIds: ['10001002', '10001003'] }
        })

        // Assert
        const detectedSpecies = JSON.parse(response.body).detectedSpecies
        expect(detectedSpecies).toBeDefined()
        expect(detectedSpecies).toBeTypeOf('object')
      })
      test('detectedSpecies is calcurate correctly on given date filter by taxon', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: '600' }
        })

        // Assert
        const detectedSpecies = JSON.parse(response.body).detectedSpecies
        expect(detectedSpecies).toBeDefined()
        expect(detectedSpecies).toBeTypeOf('object')
      })
      test('detectedSpecies is calcurate correctly on given date filter by taxons', async () => {
        // Act
        const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
        const response = await inject({
          method,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-21T11:00:00.000Z', taxons: ['100', '600'] }
        })

        // Assert
        const detectedSpecies = JSON.parse(response.body).detectedSpecies
        expect(detectedSpecies).toBeDefined()
        expect(detectedSpecies).toBeTypeOf('object')
      })
    })
  })

  // describe.each([
  //   { label: 'logged-in-not-project-member', inject: injectAsLoggedInNotProjectMember },
  //   { label: 'logged-out', inject: injectAsLoggedOut },
  //   { label: 'invalid-token', inject: injectAsLoggedOut }
  // ])('critically endangered species redacted for non-project-members', ({ inject }) => {

  // })

  // describe('critically endangered species NOT redacted for project-members', () => {

  // })

  describe('check empty value cases', async () => {
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
      const response = await injectAsLoggedInProjectMember({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })

    test('does not have any data on given date', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await injectAsLoggedInProjectMember({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2002-01-01T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })

    test('does not have any data on specific site', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await injectAsLoggedInProjectMember({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', siteIds: '10001010' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })

    test('does not have  any data on specific sites', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await injectAsLoggedInProjectMember({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', siteIds: ['10001010', '10001011'] }
      })

      // Assert
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })

    test('does not have any data on specific taxon', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await injectAsLoggedInProjectMember({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', taxons: '400' }
      })

      // Assert
      const result = JSON.parse(response.body)
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })

    test('does not have any data on specific taxons', async () => {
      // Act
      const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      const response = await injectAsLoggedInProjectMember({
        method,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z', taxons: ['400', '500'] }
      })

      // Assert
      const result = JSON.parse(response.body)
      expectedEmptyResult(result)
      expectedRichnessByTimeValueAreNumber(result)
    })
  })

  describe('check isLocationRedacted with different injection', async () => {
    const url = richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
    const options: InjectOptions = {
        method,
      url,
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
    }
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
    test('isLocationRedacted should be true if if logged in as NOT project member', async () => {
      // Act
      const response = await injectAsLoggedInNotProjectMember(options)

      // Assert
      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
      expect(result.isLocationRedacted).toBeTruthy()
    })
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

  describe('client errors', () => {
    test('rejects missing query', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
          method,
        url: richnessDatasetUrl({ projectId: PROJECT_ID_BASIC })
      })

      // Assert
      expect(response.statusCode).toBe(400)
    })

    test('rejects invalid project id', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
          method,
        url: richnessDatasetUrl({ projectId: 'x' })
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid path params: projectId')
    })

    test('reject not found project id', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
          method,
        url: richnessDatasetUrl({ projectId: '10097' }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2002-01-01T00:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode).toBe(404)
    })

    test('rejects invalid startDate', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
          method,
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

    test('rejects invalid endDate', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
          method,
        url: richnessDatasetUrl({ projectId: PROJECT_ID_BASIC }),
        query: { startDate: '2021-01-01T00:00:00.000Z', endDate: 'abc' }
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid query params')
      expect(errorMessage).toContain('endDate with value')
    })
  })
})
