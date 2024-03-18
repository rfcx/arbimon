import { type GetClassifierJobInformationResponse } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { getClassifierJobInformation as coreGetClassifierJobInformation, getClassifierJobTotalDetectionsCount } from '~/api-core/api-core'
import { type CoreClassifierJobSummary } from '~/api-core/types'

const getUnvalidatedCount = (reviewStatus: CoreClassifierJobSummary): number => {
  return reviewStatus.total - (reviewStatus.uncertain + reviewStatus.confirmed + reviewStatus.rejected)
}

export const getClassifierJobInformation = async (token: string, jobId: number): Promise<GetClassifierJobInformationResponse> => {
  const [classifierJobInfo, validationStatusAcrossJob] = await Promise.all([
    coreGetClassifierJobInformation(token, jobId),
    getClassifierJobTotalDetectionsCount(token, jobId)
  ])

  return {
    ...classifierJobInfo,
    validationStatus: {
      unvalidated: getUnvalidatedCount(validationStatusAcrossJob.reviewStatus),
      present: validationStatusAcrossJob.reviewStatus.confirmed,
      notPresent: validationStatusAcrossJob.reviewStatus.rejected,
      unknown: validationStatusAcrossJob.reviewStatus.uncertain
    }
  }
}
