import { type UpdateClassifierJobBody, type UpdateClassifierJobParams } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { updateClassifierJob } from './update-classifier-job-bll'

export const updateClassifierJobHandler: Handler<string, UpdateClassifierJobParams, unknown, UpdateClassifierJobBody> = async (req, rep) => {
  const { jobId } = req.params
  assertPathParamsExist({ jobId })

  const jobIdInteger = parseInt(jobId)
  if (Number.isNaN(jobIdInteger)) throw BioInvalidPathParamError({ jobId })

  await updateClassifierJob(req.headers.authorization ?? '', jobId, req.body)
  void rep.code(204)
  return ''
}
