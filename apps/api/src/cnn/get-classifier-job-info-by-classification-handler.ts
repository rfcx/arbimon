import { type GetClassifierJobInfoByClassificationParams, type GetClassifierJobInfoByClassificationResponse } from '@rfcx-bio/common/api-bio/cnn/classifier-job-classification'

import { type Handler } from '~/api-helpers/types'
import { getClassifierJobInfoByClassification } from './get-classifier-job-info-by-classification-bll'

export const getClassifierJobInfoByClassificationHandler: Handler<GetClassifierJobInfoByClassificationResponse, GetClassifierJobInfoByClassificationParams> = async (req) => {
  const info = await getClassifierJobInfoByClassification(req.headers.authorization ?? '', req.params.jobId, req.params.classificationValue)
  return info
}
