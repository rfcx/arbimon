import { getClassifierJobInformation as coreGetClassifierJobInformation, getClassifierJobSummaryByClassification as coreGetClassifierJobSummaryByClassification } from '~/api-core/api-core'
import { BioInvalidPathParamError } from '~/errors'

export interface ClassifierJobByClassificationInformation {
  title: string
  total: number
  streams: Array<{ id: string, name: string }>
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
    streams: jobInfo.streams
  }
}
