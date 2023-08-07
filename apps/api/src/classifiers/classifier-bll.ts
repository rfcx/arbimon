import { type ClassifierQueryParams, type ClassifierResponse } from '@rfcx-bio/common/api-bio/classifiers/classifier'

import { getClassifierFromApi } from '~/api-core/api-core'

export const getClassifier = async (token: string, classifierId: number, query: ClassifierQueryParams): Promise<ClassifierResponse> => {
  return await getClassifierFromApi(token, classifierId, query)
}
