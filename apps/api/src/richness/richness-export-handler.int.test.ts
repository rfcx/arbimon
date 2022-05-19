import { HTTPMethods } from 'fastify'
import { describe, expect, test } from 'vitest'

import { RichnessByExportReportRow, RichnessExportResponse, richnessExportUrl } from '@rfcx-bio/common/api-bio/richness/richness-export'

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

const ROUTE = '/projects/:projectId/richness-export'

const EXPECTED_PROP = 'richnessExport'

const PROJECT_ID_BASIC = '10001'
const PROJECT_ID_NO_DETECTIONS = '10003'

describe(`GET ${ROUTE} (richness export)`, async () => {
  const routes = routesRichness
  const injectAsLoggedInProjectMember = await getInjectAsLoggedInProjectMember(routes)
  const injectAsLoggedInNotProjectMember = await getInjectAsLoggedInNotProjectMember(routes)
  const injectAsLoggedOut = await getInjectAsLoggedOut(routes)
  const injectAsInvalidToken = await getInjectAsInvalidToken(routes)

  describe('happy path', () => {
    test.todo('exists', async () => {
      // Arrange
      const app = await getMockedFastify({ routes })

      // Act
      const routeList = app.printRoutes()

      // Assert
      expect(routeList).toContain(ROUTE)
    })

    test.todo('contains all expected props & no more', async () => {
      // Act
      const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: richnessExportUrl({ projectId: PROJECT_ID_BASIC }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
      })

      // Assert
      const result = JSON.parse(response.body) as RichnessExportResponse
      expect(Object.keys(result)).toEqual(EXPECTED_PROP)
      expect(Object.keys(result).length).toBe(1)
    })

    describe('contains expected results for users with different injections', async () => {
      const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
      const options: InjectOptions = {
        method: GET,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
      }
      test.todo('returns successfully for logged in project member', async () => {
        // Act
        const response = await injectAsLoggedInProjectMember(options)

        // Assert
        expect(response.statusCode).toBe(200)
        const result = JSON.parse(response.body)
        expect(result).toBeDefined()
        expect(result).toBeTypeOf('object')
      })
      test.todo('returns successfully for logged out user', async () => {
        // Act
        const response = await injectAsLoggedOut(options)

         // Assert
         expect(response.statusCode).toBe(200)
         const result = JSON.parse(response.body)
         expect(result).toBeDefined()
         expect(result).toBeTypeOf('object')
      })
      test.todo('returns successfully if the user is logged in as NOT project member', async () => {
        // Act
        const response = await injectAsLoggedInNotProjectMember(options)

         // Assert
         expect(response.statusCode).toBe(200)
         const result = JSON.parse(response.body)
         expect(result).toBeDefined()
         expect(result).toBeTypeOf('object')
      })
      test.todo('returns successfully for user with invalid token', async () => {
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
    describe('check an empty results', async () => {
      const options: InjectOptions = {
        method: GET
      }
      test.todo('does not have any result on given date', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2002-01-01T00:00:00.000Z' }
        })

        // Assert
        const result = JSON.parse(response.body)
        expect(Object.keys(result)).toEqual(EXPECTED_PROP)
        const emptyResult = result[EXPECTED_PROP] as RichnessByExportReportRow[]
        expect(emptyResult).toEqual([])
        expect(emptyResult.length).toEqual(0)
      })
      test.todo('does not have any result in empty project', async () => {
        // Act
        const url = richnessExportUrl({ projectId: PROJECT_ID_NO_DETECTIONS })
        const response = await injectAsLoggedInProjectMember({
          ...options,
          url,
          query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
        })

        // Assert
        const result = JSON.parse(response.body)
        expect(Object.keys(result)).toEqual(EXPECTED_PROP)
        const emptyResult = result[EXPECTED_PROP]
        expect(emptyResult).toEqual([])
        expect(emptyResult.length).toEqual(0)
      })
    })

    describe('check items in richnessExport', async () => {
      const url = richnessExportUrl({ projectId: PROJECT_ID_BASIC })
      const options: InjectOptions = {
        method: GET,
        url,
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
      }
      test.todo('includes all expected props', async () => {
        // Act
        const response = await injectAsLoggedInProjectMember(options)

        // Assert
        const result = JSON.parse(response.body)
      })
      test.todo('the count of items is correct', async () => {})
      test.todo('the sites names are correct', async () => {})
      test.todo('the location is correct', async () => {})
      test.todo('the datetime is correct', async () => {})
      test.todo('hours of detections are correct', async () => {})
    })
  })
  describe('client errors', () => {
    test.todo('rejects missing query', async () => {
        // Act
        const response = await injectAsLoggedInProjectMember({
        method: GET,
        url: richnessExportUrl({ projectId: PROJECT_ID_BASIC })
      })

      // Assert
      expect(response.statusCode).toBe(400)
    })

    test.todo('rejects invalid project id', async () => {
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

    test.todo('rejects invalid date', async () => {
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
