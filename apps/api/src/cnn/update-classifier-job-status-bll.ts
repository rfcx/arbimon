import { type EligibleUpdateClassifierJobStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { updateClassifierJobStatus as coreUpdateClassifierJobStatus } from '~/api-core/api-core'

export const updateClassifierJobStatus = async (token: string, jobId: string, status: EligibleUpdateClassifierJobStatus): Promise<void> => {
  await coreUpdateClassifierJobStatus(token, Number(jobId), status)
}
