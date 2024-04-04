import { type UpdateClassifierJobStatusBody, type UpdateClassifierJobStatusParams } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { type Handler } from '~/api-helpers/types'
import { updateClassifierJobStatus } from './update-classifier-job-status-bll'

export const updateClassifierJobStatusHandler: Handler<string, UpdateClassifierJobStatusParams, unknown, UpdateClassifierJobStatusBody> = async (req, rep) => {
  await updateClassifierJobStatus(req.headers.authorization ?? '', req.params.jobId, req.body.status)
  void rep.code(204)
  return ''
}
