import { type CLASSIFIER_JOB_LABELS } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'

import { getClassifierJobInformation as coreGetClassifierJobInformation, getClassifierJobSummaryByClassification as coreGetClassifierJobSummaryByClassification } from '~/api-core/api-core'
import { BioInvalidPathParamError } from '~/errors'

export interface ClassifierJobByClassificationInformation {
  title: string
  total: number
  classifierId: number
  status: keyof typeof CLASSIFIER_JOB_LABELS
  streams: Array<{ id: string, name: string }>
  queryStart: string
  queryEnd: string
}

export const getClassifierJobInfoByClassification = async (token: string, jobId: string, classificationValue: string): Promise<ClassifierJobByClassificationInformation> => {
  if (jobId === undefined || jobId === '' || Number.isNaN(Number(jobId))) {
    throw BioInvalidPathParamError({ jobId })
  }

  const [jobInfo, classificationInfo] = await Promise.all([
    coreGetClassifierJobInformation(token, Number(jobId)),
    coreGetClassifierJobSummaryByClassification(token, Number(jobId), classificationValue)
  ])

  return {
    title: classificationInfo.title,
    total: classificationInfo.total,
    classifierId: jobInfo.classifierId,
    status: jobInfo.status,
    streams: jobInfo.streams,
    queryStart: jobInfo.queryStart,
    queryEnd: jobInfo.queryEnd
  }
}
