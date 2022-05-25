import { InjectOptions } from 'fastify'
import { describe, expect, test } from 'vitest'

import { ProjectSpecificRouteParams } from '@rfcx-bio/common/api-bio/common/project-specific-route'

import { GET } from '~/api-helpers/types'
import { InjectFunction } from './get-inject'

export const describeDatasetApiReturnsValidResponse = (inject: InjectFunction, getUrl: (params: ProjectSpecificRouteParams) => string, expectedProps: string[], projectId: string): void => {
  describe('valid requests', () => {
    const method = GET
    const url = getUrl({ projectId })
    const options: InjectOptions = {
      method,
      url,
      query: { startDate: '2001-01-01T00:00:00.000Z', endDate: '2021-03-27T00:00:00.000Z' }
    }
    test('returns successfully', async () => {
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
      const response = await inject(options)

      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expectedProps.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
      expect(Object.keys(result).length).toBe(expectedProps.length)
    })

    test('does not contain any additional props', async () => {
      // Act
      const response = await inject(options)

      // Assert
      const result = JSON.parse(response.body)
      const keys = Object.keys(result)
      keys.forEach(actualProp => expect(expectedProps).toContain(actualProp))
    })
  })
}
