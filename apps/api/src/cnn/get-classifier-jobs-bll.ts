import { type ClassifierJob, CLASSIFIER_JOB_LABELS } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'

import { getClassifierJobs as getClassifierJobsFromCore } from '~/api-core/api-core'

export const getClassifierJobsFromApi = async (token: string, query: { project: string, createdBy?: 'me' | 'all' }): Promise<ClassifierJob[]> => {
  const classifierJobs = await getClassifierJobsFromCore(token, { project: query.project, createdBy: query.createdBy })
  return classifierJobs.map(c => {
    return {
      ...c,
      status: CLASSIFIER_JOB_LABELS[c.status]
    }
  })
}
