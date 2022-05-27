import { LightMyRequestResponse } from 'fastify'
import { beforeAll, describe, expect, test } from 'vitest'

import { GET } from '~/api-helpers/types'
import { DatasetInjectAndParams } from './dataset-inject-and-params'

export const describeDatasetApiReturnsValidResponse = ({ inject, getUrl, projectId, query }: DatasetInjectAndParams, expectedProps: string[]): void => {
  describe('valid requests', () => {
    let response: LightMyRequestResponse

    beforeAll(async () => {
      // Act once
      response = await inject({
        method: GET,
        url: getUrl({ projectId }),
        query
      })
    })

    test('returns successfully', async () => {
      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expect(result).toBeDefined()
      expect(result).toBeTypeOf('object')
    })

    test('contains all expected props & no more', async () => {
      // Assert
      expect(response.statusCode, response.body).toBe(200)

      const result = response.json()
      expectedProps.forEach(expectedProp => expect(result).toHaveProperty(expectedProp))
      expect(Object.keys(result).length).toBe(expectedProps.length)
    })
  })
}
