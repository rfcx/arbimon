import { createOrganizationRoute } from '@rfcx-bio/common/api-bio/organizations/create-organization'
import { searchOrganizationsRoute } from '@rfcx-bio/common/api-bio/organizations/search-organizations'

import { type RouteRegistration, GET, POST } from '~/api-helpers/types'
import { createOrganizationHandler } from './create-organization-handler'
import { searchOrganizationsHandler } from './search-organizations-handler'

export const routesOrganizations: RouteRegistration[] = [
  {
    method: GET,
    url: searchOrganizationsRoute,
    handler: searchOrganizationsHandler
  },
  {
    method: POST,
    url: createOrganizationRoute,
    handler: createOrganizationHandler
  }
]
