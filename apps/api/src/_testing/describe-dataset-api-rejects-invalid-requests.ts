import { describe, expect, test } from 'vitest'

import { GET } from '~/api-helpers/types'
import { DatasetInjectAndParams } from './dataset-inject-and-params'

export const describeDatasetApiRejectsInvalidRequests = ({ inject, getUrl, projectId, query }: DatasetInjectAndParams): void => {
  describe('invalid requests', () => {
    const validOptions = {
      method: GET,
      url: getUrl({ projectId }),
      query
    }

    test('rejects missing query', async () => {
      // Arrange & Act
      const { query, ...optionsWithQuery } = validOptions
      const response = await inject({ ...optionsWithQuery })

      // Assert
      expect(response.statusCode).toBe(400)
    })

    test('rejects invalid project id', async () => {
      // Act
      const response = await inject({ ...validOptions, url: getUrl({ projectId: 'x' }) })

      // Assert
      expect(response.statusCode).toBe(400)

      const result = JSON.parse(response.body)
      const errorMessage = result.message
      expect(errorMessage).toContain('Invalid path params: projectId')
    })

    test('rejects not found project id', async () => {
      // Act
      const response = await inject({ ...validOptions, url: getUrl({ projectId: '-1' }) })

      // Assert
      expect(response.statusCode).toBe(404)
    })

    test('rejects invalid startDate or endDate', async () => {
      // Act
      const response1 = await inject({ ...validOptions, query: { ...validOptions.query, startDate: 'abc' } })
      const response2 = await inject({ ...validOptions, query: { ...validOptions.query, endDate: 'abc' } })

      // Assert
      expect(response1.statusCode).toBe(400)
      expect(response2.statusCode).toBe(400)

      const { message: message1 } = response1.json()
      expect(message1).toContain('Invalid query params')
      expect(message1).toContain('startDate with value')

      const { message: message2 } = response2.json()
      expect(message2).toContain('Invalid query params')
      expect(message2).toContain('endDate with value')
    })
  })
}
