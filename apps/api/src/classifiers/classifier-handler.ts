import { type ClassifierParams, type ClassifierQueryParams, type ClassifierResponse } from '@rfcx-bio/common/api-bio/classifiers/classifier'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioUnauthorizedError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getClassifier } from './classifier-bll'

export const classifierHandler: Handler<ClassifierResponse, ClassifierParams, ClassifierQueryParams> = async (req) => {
  const token = req.headers.authorization

  // no token no data
  if (token === undefined || !isValidToken(token)) {
    throw BioUnauthorizedError()
  }

  // Input & validation
  const { classifierId } = req.params
  assertPathParamsExist({ classifierId })

  const classifierIdInteger = parseInt(classifierId)
  if (Number.isNaN(classifierIdInteger)) throw BioInvalidPathParamError({ classifierId })

  return await getClassifier(token, classifierIdInteger, req.query)
}
