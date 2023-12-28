import { type RecommendedOrganizationsQueryParams, type SearchOrganizationsQuerystring, type SearchOrganizationsResponse } from '@rfcx-bio/common/api-bio/organizations/search-organizations'

import { type Handler } from '~/api-helpers/types'
import { getRecommendedOrganizations, searchOrganizations } from './search-organizations-dao'

export const searchOrganizationsHandler: Handler<SearchOrganizationsResponse, unknown, SearchOrganizationsQuerystring> = async (req) => {
  // Inputs & validations
  const searchQuery = req.query?.q
  if (searchQuery == null || searchQuery === '' || searchQuery.trim() === '') {
    return []
  }

  let limit = parseInt(req.query?.limit ?? '')
  let offset = parseInt(req.query?.offset ?? '')

  if (Number.isNaN(limit)) {
    limit = 10
  }

  if (Number.isNaN(offset)) {
    offset = 0
  }

  return await searchOrganizations(searchQuery, limit, offset)
}

export const recommendedOrganizationsHandler: Handler<SearchOrganizationsResponse, unknown, RecommendedOrganizationsQueryParams> = async (req) => {
  const query = JSON.parse(JSON.stringify(req.query))
  const userIds = query['userIds[]'] != null ? Array.isArray(query['userIds[]']) ? query['userIds[]'] : [query['userIds[]']] : undefined
  if (userIds === undefined || userIds.length === 0) return []

  return await getRecommendedOrganizations(userIds)
}
