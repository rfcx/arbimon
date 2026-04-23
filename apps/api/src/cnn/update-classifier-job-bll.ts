import { type UpdateClassifierJobBody } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { getClassifierJobInformation, updateClassifierJob as coreUpdateClassifierJob } from '~/api-core/api-core'
import { getProjectByCoreId } from '@/projects/dao/projects-dao'
import { assertProjectAnalysisAllowed } from '@/projects/project-entitlement-bll'
import { BioInvalidBodyError } from '~/errors'

export const updateClassifierJob = async (token: string, jobId: string, body: UpdateClassifierJobBody): Promise<any> => {
  const { status } = body
  if (Number(status) === 20 || Number(status) === 60) {
    throw BioInvalidBodyError({ status })
  }

  const classifierJob = await getClassifierJobInformation(token, Number(jobId))
  const project = await getProjectByCoreId(classifierJob.projectId)
  if (project !== undefined) {
    await assertProjectAnalysisAllowed(project.id)
  }

  await coreUpdateClassifierJob(token, Number(jobId), { status })
}
