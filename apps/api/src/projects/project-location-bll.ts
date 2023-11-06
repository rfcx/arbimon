import { type ProjectLocationResponse } from '@rfcx-bio/common/api-bio/project/project-location'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getProjectById } from '@/projects/project-filters-dao'
import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'
import { getProjectLocationDao } from './project-location-dao'

export const getProjectLocation = async (locationProjectId: number): Promise<ProjectLocationResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const isProjectExist = await getProjectById(models, locationProjectId)
  if (!isProjectExist) throw BioNotFoundError()

  const [projectLocation] = await Promise.all([
    getProjectLocationDao(sequelize, locationProjectId)
  ])

  return projectLocation
}
