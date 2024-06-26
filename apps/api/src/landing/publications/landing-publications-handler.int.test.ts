import { describe, expect, test, vi } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { BioForbiddenError } from '~/errors'
import { routesLanding } from '../index'
import { getPublications } from './landing-publications-bll'

const ROUTE = '/landing/publications'

vi.mock('./landing-publications-bll', () => {
  return {
    getPublications: vi.fn(async () => {
      return await Promise.resolve([{
        type: 'Mention',
        author: 'Somwong B.',
        year: 2023,
        title: 'Forest acoustic monitoring',
        journal: 'n/a (book)',
        doiUrl: 'https://google.com',
        isRFCxAuthor: true,
        orgMention: 'Arbimon',
        uses: 'Arbimon',
        citations: 2
      }])
    })
  }
})

describe('GET /landing/publications', () => {
  describe('happy path test', () => {
    test('exists', async () => {
      // Arrange
      const app = await makeApp(routesLanding)

      // Act
      const routes = [...app.routes.keys()]

      // Assert
      expect(routes).toContain(ROUTE)
    })

    test('returns 200', async () => {
      // Arrange
      const app = await makeApp(routesLanding)

      // Act
      const response = await app.inject({
        method: GET,
        url: '/landing/publications'
      })

      // Assert
      expect(getPublications).toHaveBeenCalledOnce()
      expect(response.json()).toEqual([{
        type: 'Mention',
        author: 'Somwong B.',
        year: 2023,
        title: 'Forest acoustic monitoring',
        journal: 'n/a (book)',
        doiUrl: 'https://google.com',
        isRFCxAuthor: true,
        orgMention: 'Arbimon',
        uses: 'Arbimon',
        citations: 2
      }])
    })
  })

  test('angry path', async () => {
    // Arrange
    const app = await makeApp(routesLanding)
    ;(getPublications as any).mockRejectedValue(BioForbiddenError())

    // Act
    const response = await app.inject({
      method: GET,
      url: '/landing/publications'
    })

    // Assert
    expect(response.statusCode).toBe(403)
  })
})
