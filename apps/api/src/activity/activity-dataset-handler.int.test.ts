import { describe, expect, test } from 'vitest'

import { activityDatasetGeneratedUrl, ActivityOverviewDetectionDataBySite } from '@rfcx-bio/common/api-bio/activity/activity-dataset'

import { DatasetInjectAndParams } from '@/_testing/dataset-inject-and-params'
import { describeDatasetApiRejectsInvalidRequests } from '@/_testing/describe-dataset-api-rejects-invalid-requests'
import { describeDatasetApiReturnsValidResponse } from '@/_testing/describe-dataset-api-returns-valid-response'
import { getInjectAsInvalidToken, getInjectAsLoggedInNotProjectMember, getInjectAsLoggedInProjectMember, getInjectAsLoggedOut, getMockedFastify } from '@/_testing/get-inject'
import { GET } from '~/api-helpers/types'
import { routesActivity } from './index'

const ROUTE = '/projects/:projectId/activity'

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'activityBySite',
  'activityBySpecies',
  'activityByTimeHour',
  'activityByTimeDay',
  'activityByTimeMonth',
  'activityByTimeDate'
]

const PROJECT_ID_BASIC = '20001001'

describe(`GET ${ROUTE} (activity dataset)`, async () => {
  const routes = routesActivity

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
    const injectAndParams: DatasetInjectAndParams = {
      inject,
      getUrl: activityDatasetGeneratedUrl,
      projectId: PROJECT_ID_BASIC,
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-27T00:00:00.000Z' }
    }

    describeDatasetApiReturnsValidResponse(injectAndParams, EXPECTED_PROPS)
    describeDatasetApiRejectsInvalidRequests(injectAndParams)
  })

  describe('known data tests', async () => {
    // Act
    const response = await injectAsLoggedInProjectMember({
      method,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z' }
    })

    test('calculates isLocationRedacted correctly', async () => {
      const result = JSON.parse(response.body)?.isLocationRedacted
      expect(result).toBeDefined()
      expect(result).toEqual(false)
    })

    test('calculates activityBySite correctly', async () => {
      // Arrange
      const knownSiteId = 123
      const siteExpectedProperties = ['siteId', 'siteName', 'latitude', 'longitude', 'detection', 'detectionFrequency', 'occupancy']

      // Act
      const maybeResult = JSON.parse(response.body)?.activityBySite

      // Assert - property exists & correct type
      expect(maybeResult).toBeDefined()
      expect(Array.isArray(maybeResult)).toBe(true)
      const result = maybeResult as ActivityOverviewDetectionDataBySite[]
      expect(result.length).toBe(877)

      // Assert - first result is object
      const maybeKnownSite = result.find(bySite => bySite.siteId === knownSiteId)
      expect(maybeKnownSite).toBeTypeOf('object')
      const knownSite = maybeKnownSite as Record<string, any>

      // Assert - first result contains (only) expected props
      siteExpectedProperties.forEach(expectedProperty => expect(knownSite).toHaveProperty(expectedProperty))
      expect(Object.keys(knownSite).length).toBe(siteExpectedProperties.length)

      // Assert - detection, detection frequency, occupancy are correct
      expect(knownSite.detection).toBe(263)
      expect(knownSite.detectionFrequency).toBeCloseTo(0.27058, 5)
      expect(knownSite.occupancy).toBe(true)
    })

    test.todo('calculates activityBySpecies correctly', async () => {
      const result = JSON.parse(response.body)?.activityBySpecies
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculates activityByTimeHour correctly', async () => {
      const result = JSON.parse(response.body)?.activityByTimeHour
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculate activityByTimeDay correctly', async () => {
      const result = JSON.parse(response.body)?.activityByTimeDay
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculate activityByTimeMonth correctly', async () => {
      const result = JSON.parse(response.body)?.activityByTimeMonth
      expect(result).toBeDefined()
      // ...
    })

    test.todo('calculate activityByTimeDate correctly', async () => {
      const result = JSON.parse(response.body)?.activityByTimeDate
      expect(result).toBeDefined()
      // ...
    })
  })

  describe('known data tests with filtered data', async () => {
    test.todo('detectionsBySite includes all sites from the filter')
    test.todo('detectionsBySite calculates detectionFrequency correctly when a site has 0 detections')
    test.todo('detectionsBySite calculates detectionFrequency correctly when a site has some hours with 0 detections')
  })

  describe('known data tests with redacted data', async () => {
    // Act
    const response = await injectAsLoggedOut({
      method,
      url: activityDatasetGeneratedUrl({ projectId: '1' }),
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2031-01-01T00:00:00.000Z' }
    })

    test('calculates isLocationRedacted correctly', async () => {
      const result = JSON.parse(response.body)?.isLocationRedacted
      expect(result).toBeDefined()
      expect(result).toEqual(true)
    })

    test.todo('redacted species data (is / is not?) included in detectionsBySite')
  })

  describe('client errors', () => {
    test('rejects missing query', async () => {
      // Act
      const response = await injectAsLoggedOut({
        method,
        url: activityDatasetGeneratedUrl({ projectId: '1' })
      })

      // Assert
      expect(response.statusCode).toBe(400)
    })

    test('rejects invalid project id', async () => {
      // Act
      const response = await injectAsLoggedOut({
        method,
        url: activityDatasetGeneratedUrl({ projectId: 'x' })
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid path params: projectId')
    })

    test('rejects invalid date', async () => {
      // Act
      const response1 = await injectAsLoggedOut({
        method,
        url: activityDatasetGeneratedUrl({ projectId: '1' }),
        query: { startDate: 'abc', endDate: '2021-01-01T00:00:00.000Z' }
      })
      const response2 = await injectAsLoggedOut({
        method,
        url: activityDatasetGeneratedUrl({ projectId: '1' }),
        query: { startDate: '2021-01-01T00:00:00.000Z', endDate: 'abc' }
      })

      // Assert
      expect(response1.statusCode).toBe(400)
      expect(response2.statusCode).toBe(400)

      const result1 = JSON.parse(response1.body)
      const result2 = JSON.parse(response2.body)
      const errorMessage1 = result1.message
      const errorMessage2 = result2.message
      expect(errorMessage1).toContain('Invalid query params')
      expect(errorMessage2).toContain('Invalid query params')
      expect(errorMessage1).toContain('startDate with value')
      expect(errorMessage2).toContain('endDate with value')
    })

    test.todo('rejects invalid site ids')

    test.todo('rejects invalid taxons')
  })
})
