import { type CreateClassifierJobBody } from '@rfcx-bio/common/api-bio/cnn/create-classifier-job'

import { type Handler } from '~/api-helpers/types'
import { createClassifierJob } from './create-classifier-job-bll'

export const createClassifierJobHandler: Handler<string, unknown, unknown, CreateClassifierJobBody> = async (req, rep) => {
  const response = await createClassifierJob(req.headers.authorization ?? '', req.body)

  void rep.code(201)
  if (response.jobId !== undefined) {
    void rep.header('Location', `/p/${response.slug}/analyse/cnn/detail/${response.jobId}`)
  }

  return ''
}
