import { type UpdateClassifierJobBody } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { updateClassifierJob as coreUpdateClassifierJob } from '~/api-core/api-core'
import { BioInvalidBodyError } from '~/errors'

export const updateClassifierJob = async (token: string, jobId: string, body: UpdateClassifierJobBody): Promise<any> => {
  const { status } = body
    if (Number(status) === 20 || Number(status) === 60) {
      throw BioInvalidBodyError({ status })
    }

    await coreUpdateClassifierJob(token, Number(jobId), { status })
}
