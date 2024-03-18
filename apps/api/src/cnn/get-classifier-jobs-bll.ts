import { type ClassifierJob } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'

import { getClassifierJobs as coreGetClassifierJobs } from '~/api-core/api-core'

export const getClassifierJobs = async (token: string, query: { project: string, createdBy?: 'me' | 'all' }): Promise<ClassifierJob[]> => {
  const classifierJobs = await coreGetClassifierJobs(token, { project: query.project, createdBy: query.createdBy })
  return classifierJobs
}
