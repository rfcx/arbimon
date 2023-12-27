import { type RecommendedOrganizationsQuerystring, type SearchOrganizationsQuerystring, type SearchOrganizationsResponse } from '@rfcx-bio/common/api-bio/organizations/search-organizations'

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

export const recommendedOrganizationsHandler: Handler<SearchOrganizationsResponse, unknown, RecommendedOrganizationsQuerystring> = async (req) => {
  // TODO: improve this part
  const userIds = JSON.parse(JSON.stringify(req.query))
  if (userIds === undefined) {
    return []
  }

  return await getRecommendedOrganizations(userIds['userIds[]'])
}
