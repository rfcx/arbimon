import { type ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/project/project-filters'
import { type SitesRecCountAndDates } from '@rfcx-bio/common/api-bio/project/project-recordings'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

import { getLatestSync, getSites, getSitesRecordingCountAndDates, getTaxonClasses, getTimeBounds } from '@/projects/dao/project-filters-dao'
import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'
import { getProjectById } from './dao/projects-dao'

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

export const getProjectRecordingCountBySite = async (locationProjectId: number): Promise<SitesRecCountAndDates[]> => {
  const project = await getProjectById(locationProjectId)
  if (project === undefined) throw BioNotFoundError()

  const [projectSiteRecCountAndDates] = await Promise.all([
    getSitesRecordingCountAndDates(locationProjectId)
  ])

  return projectSiteRecCountAndDates
}
