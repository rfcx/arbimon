import { type UpdateClassifierJobBody, type UpdateClassifierJobParams } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { type Handler } from '~/api-helpers/types'
import { updateClassifierJob } from './update-classifier-job-bll'

export const updateClassifierJobHandler: Handler<string, UpdateClassifierJobParams, unknown, UpdateClassifierJobBody> = async (req, rep) => {
  await updateClassifierJob(req.headers.authorization ?? '', req.params.jobId, req.body)
  void rep.code(204)
  return ''
}
