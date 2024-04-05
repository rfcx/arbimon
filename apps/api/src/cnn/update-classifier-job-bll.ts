import {
  type UpdateClassifierJobBody
} from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { updateClassifierJob as coreUpdateClassifierJob } from '~/api-core/api-core'

export const updateClassifierJob = async (token: string, jobId: string, body: UpdateClassifierJobBody): Promise<void> => {
  const { status } = body
  if (status !== undefined) {
    await coreUpdateClassifierJob(token, Number(jobId), { status })
  }
}
