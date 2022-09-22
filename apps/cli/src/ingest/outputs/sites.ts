import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_LOCATION_SITE } from '@rfcx-bio/common/dao/models/location-site-model'
import { Site, SyncError } from '@rfcx-bio/common/dao/types'

import { SiteArbimon, transformArbimonSites } from '../parsers/parse-site-arbimon-to-bio'

const loopUpsert = async (sites: Array<Omit<Site, 'id'>>, sequelize: Sequelize, transaction: Transaction | null = null): Promise<Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failed: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const site of sites) {
    try {
      await ModelRepository.getInstance(sequelize).LocationSite.upsert(site)
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      failed.push({
        externalId: `${site.idArbimon}`,
        error: `InsertError: ${errorMessage}`
      })
    }
  }
  return failed
}

export const writeSitesToBio = async (sites: SiteArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[Array<Omit<Site, 'id'>>, Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const updatedSites = sites.filter(s => s.deletedAt === null)
  const deletedSites = sites.filter(s => s.deletedAt !== null)

  const [successfullyUpdatedSites, failedUpdatedSites] = await createUpdateSites(updatedSites, sequelize, transaction)
  const [successfullyDeletedSites, failedDeletedSites] = await deleteSites(deletedSites, sequelize, transaction)

  return [successfullyUpdatedSites.concat(successfullyDeletedSites), failedUpdatedSites.concat(failedDeletedSites)]
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
