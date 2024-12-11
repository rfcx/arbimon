import { type SearchResponse, type SearchType } from '@rfcx-bio/common/api-bio/search/search'

import { env } from '~/env'
import { getProjectsByQuery } from './search-local-dao'
import { getOpensearchProjects } from './search-opensearch-dao'

const localSearchDatabase = async (type: SearchType, query: string, status: string, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  if (type !== 'project') {
    return {
      total: 0,
      data: []
    }
  }
  return await getProjectsByQuery(query !== '' ? query : undefined, status, limit, offset)
}

const opensearchSearchDatabase = async (type: SearchType, query: string, status: string, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  if (type !== 'project') {
    return {
      total: 0,
      data: []
    }
  }
  if (query === '') {
    return await getProjectsByQuery(undefined, status, limit, offset)
  }
  return await getOpensearchProjects(query, status, limit, offset)
}

export const searchDatabase = async (type: SearchType, query: string, status: string, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  return env.OPENSEARCH_ENABLED === 'true' ? await opensearchSearchDatabase(type, query, status, limit, offset) : await localSearchDatabase(type, query, status, limit, offset)
}
