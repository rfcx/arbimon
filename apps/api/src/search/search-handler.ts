import { type SearchRequestQueryParams, type SearchResponse, SEARCH_TYPE, xSearchTotalCountHeaderName } from '@rfcx-bio/common/api-bio/search/search'

import { type Handler } from '~/api-helpers/types'
import { BioPublicError } from '~/errors'
import { parseLimitOffset } from './helpers'
import { searchDatabase } from './search-bll'

export const searchHandler: Handler<SearchResponse, unknown, SearchRequestQueryParams> = async (request, reply) => {
  let { type, q, isPublished, limit, offset } = request.query
  if (type === undefined) {
    throw new BioPublicError('invalid query parameter "type" cannot be empty', 400)
  }
  if (isPublished === undefined) {
    isPublished = false
  }
  if (!SEARCH_TYPE.includes(type)) {
    throw new BioPublicError(`invalid query parameter "type" of "${type}"`, 400)
  }

  const { limit: parsedLimit, offset: parsedOffset } = parseLimitOffset(limit, offset, { maxOffset: 10000, defaultLimit: 20 })
  const result = await searchDatabase(type, q === undefined ? '' : q, isPublished, parsedLimit, parsedOffset)
  void reply.header(xSearchTotalCountHeaderName, result.total)
  return result.data
}
