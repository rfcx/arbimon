import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

export const createProjectVersionIfNeeded = async (sequelize: Sequelize, projectIds: number[]): Promise<void> => {
  const projectVersionModel = ModelRepository.getInstance(sequelize).ProjectVersion
  await Promise.all(projectIds.map(async (id) => {
    return await projectVersionModel.findOrCreate({
      where: {
        projectId: id
      },
      defaults: { isPublished: false, isPublic: false }
    })
  }))
}
