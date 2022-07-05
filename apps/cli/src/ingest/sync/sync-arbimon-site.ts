import { Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'

import { getArbimonSites } from '../inputs/get-arbimon-sites'
import { writeSitesToBio } from '../outputs/sites'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncResult } from '../outputs/sync-status'
import { parseArray } from '../parsers/parse-array'
import { parseSiteArbimonToBio } from '../parsers/parse-site-arbimon-to-bio'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'
import { isSyncable } from './syncable'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Project.id,
  syncBatchLimit: 1000
}

export const syncArbimonSitesBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  // Getter
  const arbimonSites = await getArbimonSites(arbimonSequelize, syncStatus)
  console.info('- syncArbimonSitesBatch: from', syncStatus.syncUntilId, syncStatus.syncUntilDate)
  console.info('- syncArbimonSitesBatch: found %d projects', arbimonSites.length)
  if (arbimonSites.length === 0) return syncStatus

  const lastSyncdSite = arbimonSites[arbimonSites.length - 1]
  if (!isSyncable(lastSyncdSite)) throw new Error('Input does not contain needed sync-status data')

  // Parser
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(arbimonSites, parseSiteArbimonToBio)
  const siteData = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)

  // Writer
  const insertErrors = await writeSitesToBio(siteData, biodiversitySequelize)
  const transaction = await biodiversitySequelize.transaction()

  try {
    // Update sync status
    const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: lastSyncdSite.updatedAt, syncUntilId: lastSyncdSite.idArbimon.toString() }
    await writeSyncResult(updatedSyncStatus, biodiversitySequelize, transaction)

    await Promise.all(inputsAndParsingErrors.map(async e => {
      const idArbimon = isSyncable(e[0]) ? e[0].idArbimon : 'unknown'
      const error = {
        externalId: `${idArbimon}`,
        error: 'ValidationError: ' + JSON.stringify(e[1].error.issues),
        syncSourceId: updatedSyncStatus.syncDataTypeId,
        syncDataTypeId: updatedSyncStatus.syncDataTypeId
      }
      await writeSyncError(error, biodiversitySequelize, transaction)
    }))

    await Promise.all(insertErrors.map(async e => {
      const error = { ...e, syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId }
      await writeSyncError(error, biodiversitySequelize, transaction)
    }))

    // TODO: log project sync
    // group data by project id
    // count number

    // commit transactions
    await transaction.commit()
    // return sync status
    return updatedSyncStatus
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const syncArbimonSites = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<boolean> => {
  const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

  const updatedSyncStatus = await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
  return (syncStatus.syncUntilDate === updatedSyncStatus.syncUntilDate && syncStatus.syncUntilId === updatedSyncStatus.syncUntilId)
      // || numberOfItemsSynced < syncStatus.syncBatchLimit
      // TODO: add number of syncd items as a response of syncArbimonProjectsBatch so that we can check the case above ☝️
}
