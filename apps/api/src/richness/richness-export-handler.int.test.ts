import { HTTPMethods } from 'fastify'
import { describe, expect, test } from 'vitest'

import { RichnessExportResponse, richnessExportUrl } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { getInjectAsLoggedInNotProjectMember, getInjectAsLoggedInProjectMember, getInjectAsLoggedOut, getMockedFastify } from '@/_testing/get-inject'
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

const ROUTE = '/projects/:projectId/richness-export'

const EXPECTED_PROPS = {
  richnessExport: [
    'name',
    'site',
    'latitude',
    'longitude',
    'altitude',
    'day',
    'month',
    'year',
    'hour',
    'date'
  ]
}

const [EXPECTED_PROPS_KEY] = Object.keys(EXPECTED_PROPS)

const PROJECT_ID_BASIC = '10001'
const PROJECT_ID_NO_DETECTIONS = '10003'

describe(`GET ${ROUTE} (richness export)`, async () => {
  const routes = routesRichness
  const injectAsLoggedInProjectMember = await getInjectAsLoggedInProjectMember(routes)
  const injectAsLoggedInNotProjectMember = await getInjectAsLoggedInNotProjectMember(routes)
  const injectAsLoggedOut = await getInjectAsLoggedOut(routes)

  test('the route exists', async () => {
    // Arrange
    const app = await getMockedFastify({ routes })

    // Act
    const routeList = app.printRoutes({ includeHooks: true })
    // Assert
    expect(routeList).toContain('-export')
  })
  describe.each([
    ['logged-in-project-member', injectAsLoggedInProjectMember],
    ['logged-in-not-project-member', injectAsLoggedInNotProjectMember],
    ['logged-out', injectAsLoggedOut]
  ])('as %s', (_, inject) => {
    describe('basic', () => {
      const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
      const options: InjectOptions = {
        method: GET,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
      }

      test('the route contains richnessExport prop & no more', async () => {
        // Act
        const response = await inject(options)

        // Assert
        const result = JSON.parse(response.body) as RichnessExportResponse
        const [key] = Object.keys(result)
        expect(key).toEqual(EXPECTED_PROPS_KEY)
        expect([key].length).toBe(1)
      })

      test('richnessExport includes all expected props', async () => {
        // Act
        const response = await inject(options)

        // Assert
        const result = JSON.parse(response.body) as RichnessExportResponse
        const [key] = Object.keys(result)
        expect(key).toEqual(EXPECTED_PROPS_KEY)
        expect([key].length).toBe(1)
      })

      test(`returns success status response code for ${_} injection`, async () => {
        // Act
        const response = await inject(options)
        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
      })
    })
  })

  describe('validate known data', async () => {
    describe('protected data (as project member)', async () => {
      const startDate = '2001-01-01T00:00:00.000Z'
      const endDate = '2021-03-20T11:00:00.000Z'
      const options: InjectOptions = {
        method: GET,
        query: { startDate, endDate }
      }
      test('has expected results on given date', async () => {
        // Act
        const expectedObject = {
          scientificname: 'Accipitridae',
          commonname: 'Eagle',
          site: 'Test Site 2',
          latitude: 18.31307,
          longitude: -65.24878,
          altitude: 30.85246588,
          date: '2021-03-17T11:11:00.000Z',
          day: 17,
          month: 3,
          year: 2021,
          hour: 11,
          detectionminutecount: 1
        }
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url
        })

        // Assert
        const result = JSON.parse(response.body)
        const richnessExport = result.richnessExport
        expect(richnessExport.length).toEqual(6)
        expect(richnessExport).toBeDefined()
        const foundSiteDetection = richnessExport.find((item: { scientificname: string }) => item.scientificname === expectedObject.scientificname)
        expect(foundSiteDetection).toEqual(expectedObject)
      })

      test('get correct site/species/taxon by site filter', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { ...options.query, siteIds: '10001002' }
        })
        const expectedSite = 'Test Site 2'
        const expectedCommonNames = ['Sparrow', 'Eagle']
        const expectedScientificNames = ['Accipitridae', 'Passeridae']

        // Assert
        const result = JSON.parse(response.body)
        const richnessExport = result.richnessExport
        expect(richnessExport.length).toEqual(2)
        expect(richnessExport).toBeDefined()
        richnessExport.forEach((item: { site: string }) => expect(expectedSite).toEqual(item.site))
        richnessExport.forEach((item: { scientificname: string }) => expect(expectedScientificNames).toContain(item.scientificname))
        richnessExport.forEach((item: { commonname: string }) => expect(expectedCommonNames).toContain(item.commonname))
      })

      test('get correct site/species/taxon by taxon filter', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { ...options.query, taxons: '100' }
        })
        const expectedSite = 'Test Site'
        const expectedCommonName = 'Cobra'
        const expectedScientificName = 'Naja'

        // Assert
        const result = JSON.parse(response.body)
        const richnessExport = result.richnessExport
        expect(richnessExport.length).toEqual(3)
        expect(richnessExport).toBeDefined()
        richnessExport.forEach((item: { site: string }) => expect(expectedSite).toEqual(item.site))
        richnessExport.forEach((item: { scientificname: string }) => expect(expectedScientificName).toContain(item.scientificname))
        richnessExport.forEach((item: { commonname: string }) => expect(expectedCommonName).toEqual(item.commonname))
      })
      test('get correct site/species/taxon by several taxons (test using CR species)', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { ...options.query, taxons: ['100', '300'] }
        })
        const expectedSite = ['Test Site', 'Test Site 2']
        const expectedCommonNames = ['Cobra', 'Eagle', 'Sparrow']
        const expectedScientificNames = ['Naja', 'Accipitridae', 'Passeridae']

        // Assert
        const result = JSON.parse(response.body)
        const richnessExport = result.richnessExport
        expect(richnessExport.length).toEqual(5)
        expect(richnessExport).toBeDefined()
        richnessExport.forEach((item: { site: string }) => expect(expectedSite).toContain(item.site))
        richnessExport.forEach((item: { scientificname: string }) => expect(expectedScientificNames).toContain(item.scientificname))
        richnessExport.forEach((item: { commonname: string }) => expect(expectedCommonNames).toContain(item.commonname))
      })
    })

    describe('protected data (as logout member)', async () => {
      const startDate = '2001-01-01T00:00:00.000Z'
      const endDate = '2021-03-20T11:00:00.000Z'
      const options: InjectOptions = {
        method: GET,
        query: { startDate, endDate }
      }
      test('get empty result on test using CR species', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedOut({
          ...options,
          url,
          query: { ...options.query, taxons: '300' }
        })

        // Assert
        const result = JSON.parse(response.body)
        const [key] = Object.keys(result)
        expect(key).toEqual(EXPECTED_PROPS_KEY)
        const emptyResult = result.richnessExport
        expect(emptyResult).toEqual([])
        expect(emptyResult.length).toEqual(0)
      })
    })

    describe('protected data (as non-project members)', async () => {
      const startDate = '2001-01-01T00:00:00.000Z'
      const endDate = '2021-03-20T11:00:00.000Z'
      const options: InjectOptions = {
        method: GET,
        query: { startDate, endDate }
      }
      test('get empty result on test using CR species', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInNotProjectMember({
          ...options,
          url,
          query: { ...options.query, taxons: '300' }
        })

        // Assert
        const result = JSON.parse(response.body)
        const [key] = Object.keys(result)
        expect(key).toEqual(EXPECTED_PROPS_KEY)
        const emptyResult = result.richnessExport
        expect(emptyResult).toEqual([])
        expect(emptyResult.length).toEqual(0)
      })
    })

    describe('check empty value cases', async () => {
      const startDate = '2001-01-01T00:00:00.000Z'
      const endDate = ['2002-01-01T11:00:00.000Z', '2021-03-20T11:00:00.000Z']
      const options: InjectOptions = {
        method: GET,
        query: { startDate, endDate: endDate[0] }
      }
      const expectedEmptyResult = (result: RichnessExportResponse): void => {
        const [key] = Object.keys(result)
        expect(key).toEqual(EXPECTED_PROPS_KEY)
        const emptyResult = result.richnessExport
        expect(emptyResult).toEqual([])
        expect(emptyResult.length).toEqual(0)
      }
      test('has no result on a empty project', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_NO_DETECTIONS })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url
        })

        // Assert
        const result = JSON.parse(response.body)
        expectedEmptyResult(result)
      })

      test('has no result on a date without detections', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url
        })

        // Assert
        const result = JSON.parse(response.body)
        expectedEmptyResult(result)
      })

      test('has no result on a non-existent site in the project', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { ...options.query, endDate: endDate[1], siteIds: '10001010' }
        })

        // Assert
        const result = JSON.parse(response.body)
        expectedEmptyResult(result)
      })

      test('has no result on a non-existent sites in the project', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { ...options.query, endDate: endDate[1], siteIds: ['10001010', '10001011'] }
        })

        // Assert
        const result = JSON.parse(response.body)
        expectedEmptyResult(result)
      })

      test('has no result on a non-existent taxon in the project', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { ...options.query, endDate: endDate[1], taxons: '400' }
        })

        // Assert
        const result = JSON.parse(response.body)
        expectedEmptyResult(result)
      })

      test('has no result on a non-existent taxons in the project', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { ...options.query, endDate: endDate[1], taxons: ['400', '500'] }
        })

        // Assert
        const result = JSON.parse(response.body)
        expectedEmptyResult(result)
      })
    })
  })

  describe('client errors', () => {
    test('rejects missing query', async () => {
        // Act
        const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: richnessExportUrl({ projectId: PROJECT_ID_BASIC })
      })

      // Assert
      expect(response.statusCode).toBe(400)
    })

    test('rejects invalid project id', async () => {
        // Act
        const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: richnessExportUrl({ projectId: 'x' })
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
        url: richnessExportUrl({ projectId: PROJECT_ID_BASIC }),
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
