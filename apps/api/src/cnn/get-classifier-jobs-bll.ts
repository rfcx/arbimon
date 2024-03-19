import { type ClassifierJob } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'

import { getClassifierJobs as coreGetClassifierJobs } from '~/api-core/api-core'
import { BioMissingQueryParamError } from '~/errors'

export const getClassifierJobs = async (token: string, query: { project: string, createdBy?: 'me' | 'all' }): Promise<ClassifierJob[]> => {
  if (
    query?.project === null ||
    query?.project === undefined ||
    query?.project === ''
  ) {
    throw BioMissingQueryParamError('project')
  }

  const projects = query?.project ? [query.project] : []
  const createdBy = query?.createdBy ? query?.createdBy : 'all'
  const classifierJobs = await coreGetClassifierJobs(token, { projects, createdBy })
  return classifierJobs
}
