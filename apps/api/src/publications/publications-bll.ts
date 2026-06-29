import { type PublicationsResponse, type PublicationTechnique } from '@rfcx-bio/common/api-bio/publications/publications'

import { getSequelize } from '~/db'
import { env } from '~/env'
import { type PublicationsFilter, countPublications, getTechniqueFacets, listPublications, listTechniques } from './publications-dao'
import { searchOpensearchPublications } from './publications-opensearch-dao'

export const getPublications = async (filter: PublicationsFilter): Promise<PublicationsResponse> => {
  const sequelize = getSequelize()

  // Facet counts always come from Postgres (cheap aggregate, always consistent).
  const facetsPromise = getTechniqueFacets(sequelize, filter)

  // Full-text relevance ranking via OpenSearch when enabled AND a search term is
  // present; otherwise the Postgres DAO (which also covers the no-search case).
  const useOpensearch = env.OPENSEARCH_ENABLED === 'true' && (filter.search?.trim() ?? '') !== ''

  if (useOpensearch) {
    try {
      const [{ total, data }, techniqueFacets] = await Promise.all([
        searchOpensearchPublications(filter),
        facetsPromise
      ])
      return { total, limit: filter.limit, offset: filter.offset, items: data, techniqueFacets }
    } catch (e) {
      // Fail open to Postgres if OpenSearch is unavailable.
      console.error('[publications] opensearch search failed, falling back to postgres', e)
    }
  }

  const [total, items, techniqueFacets] = await Promise.all([
    countPublications(sequelize, filter),
    listPublications(sequelize, filter),
    facetsPromise
  ])

  return { total, limit: filter.limit, offset: filter.offset, items, techniqueFacets }
}

export const getPublicationTechniques = async (): Promise<PublicationTechnique[]> => {
  const sequelize = getSequelize()
  return await listTechniques(sequelize)
}
