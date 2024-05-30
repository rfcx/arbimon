import { groupBy } from 'lodash-es'
import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'

import { writeSpeciesCallsToBio } from '@/ingest/outputs/species-calls'
import { getArbimonProjectSpeciesCalls } from '../inputs/get-arbimon-species-call'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { parseArray } from '../parsers/parse-array'
import { parseSpeciesCallArbimonToBio } from '../parsers/parse-species-call-arbimon-to-bio'
import { type SyncConfig } from './sync-config'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.SpeciesCall.id,
  syncBatchLimit: 20000 // do not use for the species resync
}

export const syncArbimonSpeciesCallBatch = async (projectId: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  const arbimonSpeciesCalls = await getArbimonProjectSpeciesCalls(arbimonSequelize, projectId)

  // Exit early if nothing to sync
  if (arbimonSpeciesCalls.length === 0) return

  console.info('- syncArbimonSpeciesCallsBatch: found %d species calls', arbimonSpeciesCalls.length)

  // Parse input
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(arbimonSpeciesCalls, parseSpeciesCallArbimonToBio)
  const speciesCalls = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)

  // Write species to Bio
  const [insertSuccess, insertErrors] = await writeSpeciesCallsToBio(speciesCalls, biodiversitySequelize)
  const transaction = await biodiversitySequelize.transaction()
  try {
    // Write input/parsing errors
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

    await Promise.all(insertErrors.map(async e => {
      const error = { ...e, syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId }
      await writeSyncError(error, biodiversitySequelize, transaction)
    }))

    // log project sync
    const groupedByProject = groupBy(insertSuccess, 'callProjectId')
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

export const syncArbimonSpeciesCalls = async (projectId: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  await syncArbimonSpeciesCallBatch(projectId, arbimonSequelize, biodiversitySequelize)
}
