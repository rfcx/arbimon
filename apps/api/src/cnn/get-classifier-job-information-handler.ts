import { type GetClassifierJobInformationParams, type GetClassifierJobInformationResponse } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { type Handler } from '~/api-helpers/types'
import { getClassifierJobInformation } from './get-classifier-job-information-bll'

export const getClassifierJobInformationHandler: Handler<GetClassifierJobInformationResponse, GetClassifierJobInformationParams> = async (req) => {
  const classifierJobInformation = await getClassifierJobInformation(req.headers.authorization ?? '', req.params.jobId)
  return classifierJobInformation
}
