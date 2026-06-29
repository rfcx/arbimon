import { describe, expect, test, vi } from 'vitest'

import { makeApp } from '@rfcx-bio/testing/handlers'

import { GET } from '~/api-helpers/types'
import { routesPublications } from './index'
import { getPublications, getPublicationTechniques } from './publications-bll'

const ROUTE = '/publications'
const TECHNIQUES_ROUTE = '/publications/techniques'

vi.mock('./publications-bll', () => {
  return {
    getPublications: vi.fn(async () => await Promise.resolve({
      total: 1,
      limit: 20,
      offset: 0,
      items: [{
        id: 1,
        title: 'Real-time bioacoustics monitoring',
        year: 2013,
        doi: '10.7717/peerj.103',
        url: 'https://doi.org/10.7717/peerj.103',
        venue: 'PeerJ',
        publicationType: 'article',
        authors: ['T. M. Aide'],
        authorDisplay: 'T. M. Aide et al.',
        abstract: 'An abstract.',
        citedByCount: 473,
        citationTier: 'A',
        techniques: ['pattern_matching'],
        isRfcxAuthored: true,
        rfcxCuratedUses: 'Arbimon (PM)',
        hasPdf: true
      }],
      techniqueFacets: [{ code: 'pattern_matching', displayName: 'Pattern Matching', abbreviation: 'PM', count: 1 }]
    })),
    getPublicationTechniques: vi.fn(async () => await Promise.resolve([
      { code: 'pattern_matching', displayName: 'Pattern Matching', abbreviation: 'PM', description: null, sortOrder: 1 }
    ]))
  }
})

describe('GET /publications', () => {
  test('route exists', async () => {
    const app = await makeApp(routesPublications)
    const routes = [...app.routes.keys()]
    expect(routes).toContain(ROUTE)
    expect(routes).toContain(TECHNIQUES_ROUTE)
  })

  test('returns 200 with paginated list + facets', async () => {
    const app = await makeApp(routesPublications)
    const response = await app.inject({ method: GET, url: '/publications?technique=pattern_matching&tier=A' })
    expect(getPublications).toHaveBeenCalledOnce()
    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.total).toBe(1)
    expect(body.items[0].citationTier).toBe('A')
    expect(body.techniqueFacets[0].code).toBe('pattern_matching')
  })

  test('techniques lookup returns 200', async () => {
    const app = await makeApp(routesPublications)
    const response = await app.inject({ method: GET, url: '/publications/techniques' })
    expect(getPublicationTechniques).toHaveBeenCalledOnce()
    expect(response.statusCode).toBe(200)
    expect(response.json()[0].code).toBe('pattern_matching')
  })
})
