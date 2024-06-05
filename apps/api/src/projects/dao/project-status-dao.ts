import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type ProjectStatus } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'

const isEligibleForListedStatus = async (locationProjectId: number): Promise<boolean> => {
  const sequelize = getSequelize()
  const { LocationProjectMetric } = ModelRepository.getInstance(sequelize)
  const metric = await LocationProjectMetric.findOne({ where: { locationProjectId } })
  if (metric === null) return false
  return metric.recordingMinutesCount > 1000 && metric.siteCount > 1
}

export const updateProjectPublishStatus = async (locationProjectId: number, published: boolean): Promise<void> => {
  const sequelize = getSequelize()
  const { LocationProject } = ModelRepository.getInstance(sequelize)

  const status: ProjectStatus = published ? 'published' : (await isEligibleForListedStatus(locationProjectId) ? 'listed' : 'unlisted')

  await LocationProject.update({ status, statusUpdatedAt: new Date() }, { where: { id: locationProjectId } })
}

export const updateProjectHiddenStatus = async (locationProjectId: number, hidden: boolean): Promise<void> => {
  const sequelize = getSequelize()
  const { LocationProject } = ModelRepository.getInstance(sequelize)

  const status: ProjectStatus = hidden ? 'hidden' : (await isEligibleForListedStatus(locationProjectId) ? 'listed' : 'unlisted')

  await LocationProject.update({ status, statusUpdatedAt: new Date() }, { where: { id: locationProjectId } })
}
