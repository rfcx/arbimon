import { describe, expect, test } from 'vitest'

import { ProjectSpecificRouteParams } from '@rfcx-bio/common/api-bio/common/project-specific-route'

import { GET } from '~/api-helpers/types'
import { InjectFunction } from './get-inject'

const PROJECT_ID_BASIC = '10001'

export const describeDatasetApiReturnsValidResponse = (inject: InjectFunction, getUrl: (params: ProjectSpecificRouteParams) => string, expectedProps: string[]): void => {
  describe('valid requests', () => {
    test('returns successfully', async () => {
      // Arrange
      const options = {
        method: GET,
        url: getUrl({ projectId: PROJECT_ID_BASIC }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-20T11:00:00.000Z' }
      }

      // Act
      const response = await inject(options)

      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props & no more', async () => {
      // Act
      const response = await inject({
        method: GET,
        url: getUrl({ projectId: PROJECT_ID_BASIC }),
        query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-01-01T00:00:00.000Z', siteIds: '', taxons: '' }
      })

      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expectedProps.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
      expect(Object.keys(result).length).toBe(expectedProps.length)
    })
  })
}
