import { type ProjectFiltersResponse, type SitesRecCountAndDates } from '@rfcx-bio/common/api-bio/project/project-filters'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getLatestSync, getProjectById, getRecordingCount, getSites, getSitesRecordingCountAndDates, getTaxonClasses, getTimeBounds } from '@/projects/project-filters-dao'
import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'

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

export const getProjectRecordingCount = async (locationProjectId: number): Promise<number> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const isProjectExist = await getProjectById(models, locationProjectId)
  if (!isProjectExist) throw BioNotFoundError()

  const [projectRecCount] = await Promise.all([
    getRecordingCount(sequelize, locationProjectId)
  ])

  return projectRecCount
}

export const getProjectSitesRecordingCount = async (locationProjectId: number): Promise<SitesRecCountAndDates[]> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const isProjectExist = await getProjectById(models, locationProjectId)
  if (!isProjectExist) throw BioNotFoundError()

  const [projectSiteRecCountAndDates] = await Promise.all([
    getSitesRecordingCountAndDates(sequelize, locationProjectId)
  ])

  return projectSiteRecCountAndDates
}
