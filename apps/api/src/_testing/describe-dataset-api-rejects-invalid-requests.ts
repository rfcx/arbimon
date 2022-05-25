import { describe, expect, test } from 'vitest'

import { ProjectSpecificRouteParams } from '@rfcx-bio/common/api-bio/common/project-specific-route'

import { GET } from '~/api-helpers/types'
import { InjectFunction } from './get-inject'

const PROJECT_ID_BASIC = '10001'

export const describeDatasetApiRejectsInvalidRequests = (inject: InjectFunction, getUrl: (params: ProjectSpecificRouteParams) => string): void => {
  describe('invalid requests', () => {
    test('rejects missing query', async () => {
      // Act
      const response = await inject({
        method: GET,
        url: getUrl({ projectId: PROJECT_ID_BASIC })
      })

      // Assert
      expect(response.statusCode).toBe(400)
    })

    test('rejects invalid project id', async () => {
      // Act
      const response = await inject({
        method: GET,
        url: getUrl({ projectId: 'x' })
      })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid path params: projectId')
    })

    test('reject not found project id', async () => {
      // Act
      const response = await inject({
        method: GET,
        url: getUrl({ projectId: '-1' }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2002-01-01T00:00:00.000Z' }
      })

      // Assert
      expect(response.statusCode).toBe(404)
    })

    test('rejects invalid startDate', async () => {
      // Act
      const response = await inject({
        method: GET,
        url: getUrl({ projectId: PROJECT_ID_BASIC }),
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
      const response = await inject({
        method: GET,
        url: getUrl({ projectId: PROJECT_ID_BASIC }),
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
}
