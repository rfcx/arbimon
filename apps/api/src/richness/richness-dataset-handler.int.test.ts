import { describe, expect, test } from 'vitest'

import { richnessDatasetUrl } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

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

const TEST_PROJECT_ID = '2'

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

  describe('validate known data', () => {
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
