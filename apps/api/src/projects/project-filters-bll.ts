import { ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/project/project-filters'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSites, getTaxonClasses, getTimeBounds, getUpdatedProject } from '@/projects/project-filters-dao'
import { getSequelize } from '~/db'

export const getProjectFilters = async (projectId: number): Promise<ProjectFiltersResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const [locationSites, taxonClasses, [dateStartInclusiveUtc, dateEndInclusiveUtc], updatedList] = await Promise.all([
    getSites(models, projectId),
    getTaxonClasses(models, projectId),
    getTimeBounds(models, projectId),
    getUpdatedProject(models, projectId)
  ])

  return {
    locationSites,
    taxonClasses,
    dateStartInclusiveUtc,
    dateEndInclusiveUtc,
    updatedList
  }
}
