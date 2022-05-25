import { HTTPMethods, LightMyRequestResponse } from 'fastify'
import { describe, expect, test } from 'vitest'

import { richnessExportUrl } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { describeDatasetApiRejectsInvalidRequests } from '@/_testing/describe-dataset-api-rejects-invalid-requests'
import { describeDatasetApiReturnsValidResponse } from '@/_testing/describe-dataset-api-returns-valid-response'
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

const EXPECTED_PROPS = [
  'richnessExport'
]

const EXPECTED_PROPS_RICHNESS_EXPORT = [
  'scientificName',
  'commonName',
  'site',
  'latitude',
  'longitude',
  'altitude',
  'date',
  'year',
  'month',
  'day',
  'hour',
  'detectionMinuteCount'
]

const PROJECT_ID_BASIC = '10001'
const PROJECT_ID_NO_DETECTIONS = '10003'

const expectEmptyResponse = (response: LightMyRequestResponse): void => {
  const result = response.json()
  expect(Object.keys(result).length).toBe(1)
  expect(result.richnessExport).toStrictEqual([])
}

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
    describeDatasetApiReturnsValidResponse(inject, richnessExportUrl, EXPECTED_PROPS)
    describeDatasetApiRejectsInvalidRequests(inject, richnessExportUrl)

    describe('basic', () => {
      const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
      const options: InjectOptions = {
        method: GET,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
      }

      test('richnessExport includes all expected props', async () => {
        // Act
        const response = await inject(options)

        // Assert
        const { richnessExport } = response.json()
        expect(Array.isArray(richnessExport)).toBeDefined()
        expect(richnessExport.length).toBeGreaterThan(0)

        const firstEntry = richnessExport[0]
        EXPECTED_PROPS_RICHNESS_EXPORT.forEach(expectedProp => expect(firstEntry).toHaveProperty(expectedProp))
        expect(Object.keys(richnessExport).length).toBe(EXPECTED_PROPS_RICHNESS_EXPORT.length)
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
        expectEmptyResponse(response)
      })

      test('get correct site/species/taxon on non-CR species', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedOut({
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
        expectEmptyResponse(response)
      })

      test('get correct site/species/taxon on non-CR species', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInNotProjectMember({
          ...options,
          url,
          query: { ...options.query, taxons: '600' }
        })
        const expectedSite = 'Test Site'
        const expectedCommonName = 'Cat'
        const expectedScientificName = 'Felis catus'

        // Assert
        const result = JSON.parse(response.body)
        const richnessExport = result.richnessExport
        expect(richnessExport.length).toEqual(1)
        expect(richnessExport).toBeDefined()
        richnessExport.forEach((item: { site: string }) => expect(expectedSite).toEqual(item.site))
        richnessExport.forEach((item: { scientificname: string }) => expect(expectedScientificName).toContain(item.scientificname))
        richnessExport.forEach((item: { commonname: string }) => expect(expectedCommonName).toEqual(item.commonname))
      })
    })

    describe('check empty value cases', async () => {
      const startDate = '2001-01-01T00:00:00.000Z'
      const endDate = ['2002-01-01T11:00:00.000Z', '2021-03-20T11:00:00.000Z']
      const options: InjectOptions = {
        method: GET,
        query: { startDate, endDate: endDate[0] }
      }

      test('has no result on a empty project', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_NO_DETECTIONS })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url
        })

        // Assert
        expectEmptyResponse(response)
      })

      test('has no result on a date without detections', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url
        })

        // Assert
        expectEmptyResponse(response)
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
        expectEmptyResponse(response)
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
        expectEmptyResponse(response)
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
        expectEmptyResponse(response)
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
        expectEmptyResponse(response)
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
