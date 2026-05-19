import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type ProjectStatus, type ProjectType } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'

const isEligibleForListedStatus = async (locationProjectId: number): Promise<boolean> => {
  const sequelize = getSequelize()
  const { LocationProjectMetric } = ModelRepository.getInstance(sequelize)
  const metric = await LocationProjectMetric.findOne({ where: { locationProjectId } })
  if (metric === null) return false
  return metric.recordingMinutesCount > 1000 && metric.siteCount > 1
}

const getProjectType = async (locationProjectId: number): Promise<ProjectType> => {
  const sequelize = getSequelize()
  const { LocationProject } = ModelRepository.getInstance(sequelize)
  const project = await LocationProject.findByPk(locationProjectId, { attributes: ['projectType'], raw: true })
  return project?.projectType ?? 'free'
}

const getVisibleNonPublishedStatus = async (locationProjectId: number): Promise<ProjectStatus> => {
  const projectType = await getProjectType(locationProjectId)
  if (projectType === 'premium' || projectType === 'unlimited') return 'unlisted'
  return await isEligibleForListedStatus(locationProjectId) ? 'listed' : 'unlisted'
}

export const updateProjectPublishStatus = async (locationProjectId: number, published: boolean): Promise<void> => {
  const sequelize = getSequelize()
  const { LocationProject } = ModelRepository.getInstance(sequelize)

  const status: ProjectStatus = published ? 'published' : await getVisibleNonPublishedStatus(locationProjectId)

  await LocationProject.update({ status, statusUpdatedAt: new Date() }, { where: { id: locationProjectId } })
}

export const updateProjectHiddenStatus = async (locationProjectId: number, hidden: boolean): Promise<void> => {
  const sequelize = getSequelize()
  const { LocationProject } = ModelRepository.getInstance(sequelize)

  const status: ProjectStatus = hidden ? 'hidden' : await getVisibleNonPublishedStatus(locationProjectId)

  await LocationProject.update({ status, statusUpdatedAt: new Date() }, { where: { id: locationProjectId } })
}
