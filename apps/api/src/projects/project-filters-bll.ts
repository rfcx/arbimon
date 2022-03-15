import { ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/common/project-filters'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSites, getTaxonClasses, getTimeBounds } from '@/projects/project-filters-dao'
import { getSequelize } from '~/db'

export const getProjectFilters = async (locationProjectId: number): Promise<ProjectFiltersResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const [locationSites, taxonClasses, [dateStartInclusiveUtc, dateEndInclusiveUtc]] = await Promise.all([
    getSites(models, locationProjectId),
    getTaxonClasses(models, locationProjectId),
    getTimeBounds(models, locationProjectId)
  ])

  return {
    locationSites,
    taxonClasses,
    dateStartInclusiveUtc,
    dateEndInclusiveUtc
  }
}
