import { type GetClassifierJobInformationParams, type GetClassifierJobInformationResponse } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { getClassifierJobInformation } from './get-classifier-job-information-bll'

export const getClassifierJobInformationHandler: Handler<GetClassifierJobInformationResponse, GetClassifierJobInformationParams> = async (req) => {
  if (
    req.params?.jobId === null ||
    req.params?.jobId === undefined ||
    req.params?.jobId === '' ||
    Number.isNaN(Number(req.params?.jobId))
  ) {
    throw BioInvalidPathParamError({ jobId: req.params.jobId })
  }

  const classifierJobInformation = await getClassifierJobInformation(req.headers.authorization ?? '', Number(req.params.jobId))
  return classifierJobInformation
}
