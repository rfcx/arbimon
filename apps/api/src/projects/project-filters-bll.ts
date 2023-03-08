import { type ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/project/project-filters'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getLatestSync, getSites, getTaxonClasses, getTimeBounds } from '@/projects/project-filters-dao'
import { getSequelize } from '~/db'

export const getProjectFilters = async (locationProjectId: number): Promise<ProjectFiltersResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const [locationSites, taxonClasses, [dateStartInclusiveUtc, dateEndInclusiveUtc], latestSync] = await Promise.all([
    getSites(models, locationProjectId),
    getTaxonClasses(models, locationProjectId),
    getTimeBounds(models, locationProjectId),
    getLatestSync(models, sequelize, locationProjectId)
  ])

  return {
    locationSites,
    taxonClasses,
    dateStartInclusiveUtc,
    dateEndInclusiveUtc,
    latestSync
  }
}
