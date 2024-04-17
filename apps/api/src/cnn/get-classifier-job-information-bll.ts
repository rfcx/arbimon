import { type GetClassifierJobInformationResponse } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { getClassifierJobInformation as coreGetClassifierJobInformation, getClassifierJobTotalDetectionsCount } from '~/api-core/api-core'
import { BioInvalidPathParamError } from '~/errors'

export const getClassifierJobInformation = async (token: string, jobId: string | undefined): Promise<GetClassifierJobInformationResponse> => {
  if (
    jobId === undefined ||
    jobId === '' ||
    Number.isNaN(Number(jobId))
  ) {
    throw BioInvalidPathParamError({ jobId })
  }

  const jobIdInt = Number(jobId)
  const [classifierJobInfo, validationStatusAcrossJob] = await Promise.all([
    coreGetClassifierJobInformation(token, jobIdInt),
    getClassifierJobTotalDetectionsCount(token, jobIdInt)
  ])

  return {
    ...classifierJobInfo,
    validationStatus: {
      total: validationStatusAcrossJob.reviewStatus.total,
      unvalidated: validationStatusAcrossJob.reviewStatus.unreviewed,
      present: validationStatusAcrossJob.reviewStatus.confirmed,
      notPresent: validationStatusAcrossJob.reviewStatus.rejected,
      unknown: validationStatusAcrossJob.reviewStatus.uncertain
    }
  }
}
