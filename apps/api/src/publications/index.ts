import { publicationsRoute, publicationTechniquesRoute } from '@rfcx-bio/common/api-bio/publications/publications'

import { type RouteRegistration, GET } from '~/api-helpers/types'
import { publicationsHandler, publicationTechniquesHandler } from './publications-handler'

export const routesPublications: RouteRegistration[] = [
  {
    method: GET,
    url: publicationTechniquesRoute,
    handler: publicationTechniquesHandler
  },
  {
    method: GET,
    url: publicationsRoute,
    handler: publicationsHandler
  }
]
