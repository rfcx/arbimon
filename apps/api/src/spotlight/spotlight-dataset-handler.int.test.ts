import { describe, expect, test } from 'vitest'

import { spotlightDatasetUrl } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

import { getInjectAsLoggedInProjectMember, getMockedFastify } from '@/_testing/get-inject'
import { GET } from '~/api-helpers/types'
import { routesSpotlight } from './index'

const ROUTE = '/projects/:projectId/spotlight'

const EXPECTED_PROPS = [
  'isLocationRedacted',
  'totalSiteCount',
  'totalRecordingCount',
  'detectionCount',
  'detectionFrequency',
  'occupiedSiteCount',
  'occupiedSiteFrequency',
  'detectionsByLocationSite',
  'detectionsByTimeHour',
  'detectionsByTimeDay',
  'detectionsByTimeMonth',
  'detectionsByTimeYear',
  'detectionsByTimeDate',
  'detectionsByTimeMonthYear'
]

describe(`GET ${ROUTE} (spotlight dataset)`, async () => {
  const routes = routesSpotlight
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
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '' }
      })

      // Assert
      expect(response.statusCode).toBe(200)

      const result = JSON.parse(response.body)
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '' }
      })

      // Assert
      const result = JSON.parse(response.body)
      EXPECTED_PROPS.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
    })

    test('does not contain any additional props', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
    })

    test('calculate correct total site count, recording count, detection count, detection frequency, occupied site count, and occupied site frequency', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '' }
      })

      // Assert
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
      // const totalSiteCount = result.totalSiteCount
      // const totalRecordingCount = result.totalRecordingCount
      // const detectionCount = result.detectionCount
      // const detectionFrequency = result.detectionFrequency
      // const occupiedSiteCount = result.occupiedSiteCount
      // const occupiedSiteFrequency = result.occupiedSiteFrequency
    })

    // ! All the happy case below must have another set to check for `isLocationRedacted` data

    test('calculate correct detection count, detection frequency, and naive occupancy by site', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
      // const detectionsBySite = result.detectionsByLocationSite
    })

    test(`GET ${ROUTE} calculate correct detection count and detection frequency for hourly`, async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-23)
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
      // const detectionsBySite = result.detectionsByTimeHour
    })

    test('calculate correct detection count and detection frequency for day', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-6)
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
      // const detectionsBySite = result.detectionsByTimeDay
    })

    test('calculate correct detection count and detection frequency for month', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of 0-11)
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
      // const detectionsBySite = result.detectionsByTimeMonth
    })

    test('calculate correct detection count and detection frequency for year', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of years)
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
      // const detectionsBySite = result.detectionsByTimeYear
    })

    test('calculate correct detection count and detection frequency for date', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of date unix)
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
      // const detectionsBySite = result.detectionsByTimeDate
    })

    test('calculate correct detection count and detection frequency for month/year', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert TODO: Make mock data for calcurating known result (detection and detection frequency have record of each month/years)
      const result = JSON.parse(response.body)
      Object.keys(result).forEach(actualProp => expect(EXPECTED_PROPS).toContain(actualProp))
      // const detectionsBySite = result.detectionsByTimeMonthYear
    })
  })

  describe('client errors', () => {
    test('rejects missing query', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' })
      })

      // Assert
      expect(response.statusCode).toBe(400)
    })

    test('rejects invalid project id', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' })
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid path params: projectId')
    })

    test('missing species id', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { startDate: '2021-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid query params')
    })

    test('invalid species id', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: 'xxx', startDate: '2021-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid query params')
    })

    test('not found species with given id', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '9999', startDate: '2021-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode).toBe(404)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Data not found')
    })

    test('rejects invalid date', async () => {
      // Arrange & Act once
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: spotlightDatasetUrl({ projectId: '1' }),
        query: { speciesId: '1', startDate: 'abc', endDate: '2021-01-01T00:00:00.000Z' }
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
