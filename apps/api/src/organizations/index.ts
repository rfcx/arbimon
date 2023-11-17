import { searchOrganizationsRoute } from '@rfcx-bio/common/api-bio/organizations/search-organizations'

import { type RouteRegistration, GET } from '~/api-helpers/types'
import { searchOrganizationsHandler } from './search-organizations-handler'

export const routesOrganizations: RouteRegistration[] = [
  {
    method: GET,
    url: searchOrganizationsRoute,
    handler: searchOrganizationsHandler
  }
]
