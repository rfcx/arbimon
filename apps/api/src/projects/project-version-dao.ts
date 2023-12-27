import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const createProjectVersion = async (locationProjectId: number, isPublic: boolean): Promise<void> => {
  const sequelize = getSequelize()
  const { ProjectVersion } = ModelRepository.getInstance(sequelize)
  // TODO: check if project version already exists
  await ProjectVersion.create({ locationProjectId, isPublic, isPublished: false })
}

export const updateProjectVersion = async (locationProjectId: number, isPublic: boolean): Promise<void> => {
  const sequelize = getSequelize()
  const { ProjectVersion } = ModelRepository.getInstance(sequelize)
  await ProjectVersion.update({ isPublic }, { where: { locationProjectId }, returning: true })
}

export const getProjectVersion = async (locationProjectId: number): Promise<{ isPublic: boolean, isPublished: boolean }> => {
  const sequelize = getSequelize()
  const { ProjectVersion } = ModelRepository.getInstance(sequelize)
  const res = await ProjectVersion.findOne({
    where: { locationProjectId },
    attributes: ['isPublic', 'isPublished'],
    raw: true
  })
  if (!res) throw new Error(`Failed to get project version for locationProjectId: ${locationProjectId}`)
  return res
}
