import { type Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import type { Project } from '@rfcx-bio/node-common/dao/types/location-project'


export const getProjectFromSlug = async (
  sequelize: Sequelize,
  slug: string,
): Promise<Project | null> => {
  const { LocationProject } = ModelRepository.getInstance(sequelize)
  const project = await LocationProject.findOne({ where: { slug } })
  return project
}
