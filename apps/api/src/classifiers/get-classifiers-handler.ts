import { type GetClassifiersQueryParams, type GetClassifiersResponse } from '@rfcx-bio/common/api-bio/classifiers/classifiers'

import { type Handler } from '~/api-helpers/types'
import { getClassifiers } from './get-classifiers-bll'

export const getClassifiersHandler: Handler<GetClassifiersResponse, unknown, GetClassifiersQueryParams> = async (req, rep) => {
  return await getClassifiers(req.headers?.authorization ?? '', req.query)
}
