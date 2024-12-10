import { type SearchResponse, type SearchType } from '@rfcx-bio/common/api-bio/search/search'

import { env } from '~/env'
import { getProjectsByQuery } from './search-local-dao'
import { getOpensearchProjects } from './search-opensearch-dao'

const localSearchDatabase = async (type: SearchType, query: string, isPublished: boolean, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  if (type !== 'project') {
    return {
      total: 0,
      data: []
    }
  }
  return await getProjectsByQuery(query !== '' ? query : undefined, isPublished, limit, offset)
}

const opensearchSearchDatabase = async (type: SearchType, query: string, isPublished: boolean, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  if (type !== 'project') {
    return {
      total: 0,
      data: []
    }
  }
  if (query === '') {
    return await getProjectsByQuery(undefined, isPublished, limit, offset)
  }
  return await getOpensearchProjects(query, isPublished, limit, offset)
}

export const searchDatabase = async (type: SearchType, query: string, isPublished: boolean, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  return env.OPENSEARCH_ENABLED === 'true' ? await opensearchSearchDatabase(type, query, isPublished, limit, offset) : await localSearchDatabase(type, query, isPublished, limit, offset)
}
