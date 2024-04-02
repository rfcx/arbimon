import { type Classifier, type GetClassifiersQueryParams } from '@rfcx-bio/common/api-bio/classifiers/classifiers'

import { parseLimitOffset } from '@/search/helpers'
import { getClassifiers as coreGetClassifiers } from '~/api-core/api-core'

export const getClassifiers = async (token: string, params: GetClassifiersQueryParams): Promise<Classifier[]> => {
  const { limit, offset } = parseLimitOffset(params.limit, params.offset, {
    defaultLimit: 100
  })

  return await coreGetClassifiers(token, {
    limit,
    offset,
    sort: params.sort === undefined || params.sort === '' ? undefined : params.sort
  })
}
