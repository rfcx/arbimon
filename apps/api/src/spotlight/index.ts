import { spotlightDatasetRoute } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

import { GET, RouteRegistration } from '../_services/api-helper/types'
import { spotlightDatasetController } from './controller-spotlight-dataset'

export const routesSpotlight: RouteRegistration[] = [
  [GET, spotlightDatasetRoute, spotlightDatasetController]
]
