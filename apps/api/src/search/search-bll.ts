import { type SearchResponse, type SearchType } from '@rfcx-bio/common/api-bio/search/search'

import { env } from '~/env'
import { getProjectsByQuery } from './search-local-dao'

const localSearchDatabase = async (type: SearchType, query: string, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  if (type !== 'project' || query === '') {
    return {
      total: 0,
      data: []
    }
  }
  return await getProjectsByQuery(query, limit, offset)
}

const opensearchSearchDatabase = async (type: SearchType, query: string, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  console.info('using opensearch')

  // TODO: the actual oopensearch stuff
  return {
    total: 0,
    data: []
  }
}

export const searchDatabase = env.OPENSEARCH_ENABLED === 'true' ? opensearchSearchDatabase : localSearchDatabase
