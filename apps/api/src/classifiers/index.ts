import { classifierRoute } from '@rfcx-bio/common/api-bio/classifiers/classifier'
import { getClassifiersRoute } from '@rfcx-bio/common/api-bio/classifiers/classifiers'

import { type RouteRegistration, GET } from '~/api-helpers/types'
import { classifierHandler } from './classifier-handler'
import { getClassifiersHandler } from './get-classifiers-handler'

export const routesClassifiers: RouteRegistration[] = [
  {
    method: GET,
    url: classifierRoute,
    handler: classifierHandler
  },
  {
    method: GET,
    url: getClassifiersRoute,
    handler: getClassifiersHandler
  }
]
