import { classifierRoute } from '@rfcx-bio/common/api-bio/classifiers/classifier'

import { type RouteRegistration, GET } from '~/api-helpers/types'
import { classifierHandler } from './classifier-handler'

export const routesClassifiers: RouteRegistration[] = [
  {
    method: GET,
    url: classifierRoute,
    handler: classifierHandler
  }
]
