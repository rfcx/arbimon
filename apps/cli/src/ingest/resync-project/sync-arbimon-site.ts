import { groupBy } from 'lodash-es'
import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'

import { getArbimonSitesByProject } from '../inputs/get-arbimon-site'
import { writeSitesToBio } from '../outputs/sites'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { parseArray } from '../parsers/parse-array'
import { parseSiteArbimon } from '../parsers/parse-site-arbimon-to-bio'
import { type SyncConfig } from './sync-config'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Site.id,
  syncBatchLimit: 20000 // do not use for the sites resync
}

export const syncArbimonSites = async (projectId: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, verbose: boolean = true): Promise<void> => {
  // Getter
  const rawArbimonSites = await getArbimonSitesByProject(arbimonSequelize, projectId)
  if (verbose) {
    console.info('- syncArbimonSites: found %d sites', rawArbimonSites.length)
  }
  if (rawArbimonSites.length === 0) return

  // Parser
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(rawArbimonSites, parseSiteArbimon)
  const arbimonSites = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)

  // Writer
  const [writtenSites, writeErrors] = await writeSitesToBio(arbimonSites, biodiversitySequelize)
  const transaction = await biodiversitySequelize.transaction()

  try {
    // Write species to Bio
    await Promise.all(inputsAndParsingErrors.map(async (e: any) => {
      const idArbimon = e[0].idArbimon as number
      const error = {
        externalId: `${idArbimon}`,
        error: 'ValidationError: ' + JSON.stringify(e[1].error.issues),
        syncSourceId: SYNC_CONFIG.syncSourceId,
        syncDataTypeId: SYNC_CONFIG.syncDataTypeId
      }
      await writeSyncError(error, biodiversitySequelize, transaction)
    }))

    await Promise.all(writeErrors.map(async e => {
      const error = { ...e, syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId }
      await writeSyncError(error, biodiversitySequelize, transaction)
    }))

    // log project sync
    const groupedByProject = groupBy(writtenSites, 'locationProjectId')
    await Promise.all(Object.keys(groupedByProject).map(async projectId => {
      const log = {
        locationProjectId: parseInt(projectId),
        syncSourceId: SYNC_CONFIG.syncSourceId,
        syncDataTypeId: SYNC_CONFIG.syncDataTypeId,
        delta: groupedByProject[projectId].length
      }
      await writeSyncLogByProject(log, biodiversitySequelize, transaction)
    }))

    // commit transactions
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
