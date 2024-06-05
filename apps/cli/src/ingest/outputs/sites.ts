import { type Sequelize, type Transaction, QueryTypes } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_LOCATION_SITE } from '@rfcx-bio/node-common/dao/models/location-site-model'
import { type Site, type SyncError } from '@rfcx-bio/node-common/dao/types'

import { type SiteArbimon, transformArbimonSites } from '../parsers/parse-site-arbimon-to-bio'

const loopUpsert = async (sites: Array<Omit<Site, 'id'>>, sequelize: Sequelize, transaction: Transaction | null = null): Promise<Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failed: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const site of sites) {
    try {
      await ModelRepository.getInstance(sequelize).LocationSite.upsert(site)
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      const errorName = (e instanceof Error) ? e.name : ''
      failed.push({
        externalId: `${site.idArbimon}`,
        error: `InsertError: ${errorMessage}, ${errorName}, idC:${site.idCore}, idP:${site.locationProjectId}, n:${site.name}`
      })
    }
  }
  return failed
}

export const writeSitesToBio = async (sites: SiteArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[Array<Omit<Site, 'id'>>, Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const updatedSites = sites.filter(s => s.deletedAt === null)
  const deletedSites = sites.filter(s => s.deletedAt !== null)

  // Find site changes that will affect children (e.g. recordings, detections)
  const updatedSitesWithChangedProjectIds = await getSiteIdsWithChangedProjectIds(updatedSites, sequelize, transaction)

  // Make site changes
  const [successfullyUpdatedSites, failedUpdatedSites] = await createUpdateSites(updatedSites, sequelize, transaction)
  const [successfullyDeletedSites, failedDeletedSites] = await deleteSites(deletedSites, sequelize, transaction)

  // Update parents (e.g. projects)
  const successfullyUpdatedProjectIds = [...new Set([...successfullyDeletedSites.map(s => s.locationProjectId), ...successfullyUpdatedSites.map(s => s.locationProjectId)])]
  const failedUpdatedProjects = await updateProjectComputedColumns(successfullyUpdatedProjectIds, sequelize, transaction)

  // Update children
  const successfullyUpdatedSitesWithChangedProjectIds = successfullyUpdatedSites
    .filter(s => updatedSitesWithChangedProjectIds.includes(s.idArbimon))
  await updateDependentProjectIdColumns(successfullyUpdatedSitesWithChangedProjectIds, sequelize, transaction)

  return [successfullyUpdatedSites.concat(successfullyDeletedSites), failedUpdatedSites.concat(failedDeletedSites, failedUpdatedProjects)]
}

const createUpdateSites = async (sites: SiteArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[Array<Omit<Site, 'id'>>, Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const transformedSites = await transformArbimonSites(sites, sequelize)
  try {
    await ModelRepository.getInstance(sequelize).LocationSite
      .bulkCreate(transformedSites, {
        updateOnDuplicate: UPDATE_ON_DUPLICATE_LOCATION_SITE,
        ...transaction && { transaction }
      })
  } catch (batchInsertError) {
    console.info('⚠️ Batch insert failed... try loop upsert')
    const failed = await loopUpsert(transformedSites, sequelize, transaction)
    return [
      transformedSites.filter(site => !failed.find(error => error.externalId === `${site.idArbimon}`)),
      failed
    ]
  }
  return [transformedSites, []]
}

const deleteSites = async (sites: SiteArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[Array<Omit<Site, 'id'>>, Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const succeeded: Site[] = []
  const failed: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []

  for (const site of sites) {
    const bioSite = await ModelRepository.getInstance(sequelize).LocationSite.findOne({ where: { idArbimon: site.idArbimon }, transaction })
    if (bioSite === null) { // Already deleted or never created
      continue
    }
    try {
      await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.destroy({ where: { locationSiteId: bioSite?.id }, transaction })
      await ModelRepository.getInstance(sequelize).RecordingBySiteHour.destroy({ where: { locationSiteId: bioSite?.id }, transaction })
      await ModelRepository.getInstance(sequelize).TaxonSpeciesCall.destroy({ where: { callSiteId: bioSite?.id }, transaction })
      await ModelRepository.getInstance(sequelize).LocationSite.destroy({ where: { id: bioSite?.id }, transaction })
      succeeded.push(bioSite)
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      failed.push({
        externalId: `${site.idArbimon}`,
        error: `DeleteError: ${errorMessage}`
      })
    }
  }
  return [succeeded, failed]
}

const updateProjectComputedColumns = async (ids: number[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const sql = `
    WITH subquery AS (
      SELECT location_project.id, min(latitude) latitude_min, max(latitude) latitude_max, min(longitude) longitude_min, max(longitude) longitude_max
      FROM location_project left join (select location_project_id, latitude, longitude FROM location_site WHERE latitude != 0 AND latitude is not null) s ON location_project.id = s.location_project_id GROUP BY 1)
    UPDATE location_project
    SET latitude_north = subquery.latitude_min, latitude_south = subquery.latitude_max, longitude_east = subquery.longitude_min, longitude_west = subquery.longitude_max, updated_at = now()
    FROM subquery WHERE location_project.id = subquery.id and location_project.id = $id
  `
  const failed: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const id of ids) {
    try {
      await sequelize.query(sql, { bind: { id }, transaction })
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      failed.push({
        externalId: `${id}`,
        error: `UpdateProjectComputedError: ${errorMessage}`
      })
    }
  }
  return failed
}

const getSiteIdsWithChangedProjectIds = async (sites: SiteArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<number[]> => {
  const sql = 'select 1 from location_project p join location_site s on p.id = s.location_project_id where s.id_arbimon = $id and p.id_arbimon != $project'
  return sites
    .filter(async (site) => (await sequelize.query(sql, { type: QueryTypes.SELECT, bind: { id: site.idArbimon, project: site.projectIdArbimon } })).length > 0)
    .map(s => s.idArbimon)
}

const updateDependentProjectIdColumns = async (sites: Array<Omit<Site, 'id'>>, sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  for (const { idArbimon, locationProjectId } of sites) {
    const site = await ModelRepository.getInstance(sequelize).LocationSite.findOne({ where: { idArbimon } })
    await ModelRepository.getInstance(sequelize).RecordingBySiteHour.update(
      { locationProjectId },
      { where: { locationSiteId: site?.id }, returning: false, transaction }
    )
    await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.update(
      { locationProjectId },
      { where: { locationSiteId: site?.id }, returning: false, transaction }
    )
  }
}
