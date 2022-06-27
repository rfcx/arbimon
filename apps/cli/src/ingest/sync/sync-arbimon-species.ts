import { partition } from 'lodash-es'
import { Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getArbimonSpecies } from '@/ingest/inputs/get-arbimon-species'
import { writeSpeciesToBio } from '@/ingest/outputs/species'
import { writeSyncResult } from '../outputs/sync-status'
import { parseSpeciesArbimonToBio } from '../parsers/parse-species-arbimon-to-bio'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.ArbimonValidated.id,
  syncDataTypeId: masterSyncDataTypes.Species.id,
  syncBatchLimit: 1000
}

export const syncArbimonSpeciesBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  const arbimonSpecies = await getArbimonSpecies(arbimonSequelize, syncStatus)
  const classes = await ModelRepository.getInstance(biodiversitySequelize).TaxonClass.findAll()
  if (arbimonSpecies.length === 0) return syncStatus
  const [species] = partition(arbimonSpecies.map(parseSpeciesArbimonToBio), p => p.success)

  const speciesData = species.map(sp => {
    return { ...sp.data, taxonClassId: classes.find(cl => cl.idArbimon === sp.data.taxonClassId)?.id }
  })
  const transaction = await biodiversitySequelize.transaction()
  try {
    await writeSpeciesToBio(speciesData, biodiversitySequelize, transaction)
    const lastSyncedTaxonSpecies = arbimonSpecies[speciesData.length - 1]
    const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: lastSyncedTaxonSpecies.updatedAt, syncUntilId: lastSyncedTaxonSpecies.idArbimon }
    await writeSyncResult(updatedSyncStatus, biodiversitySequelize, transaction)
    await transaction.commit()
    return updatedSyncStatus
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const syncArbimonSpecies = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  let syncStatus = await ModelRepository.getInstance(getSequelize())
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

  while (true) {
    const updatedSyncStatus = await syncArbimonSpeciesBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
    if (syncStatus.syncUntilDate === updatedSyncStatus.syncUntilDate && syncStatus.syncUntilId === updatedSyncStatus.syncUntilId) return
    syncStatus = updatedSyncStatus
  }
}
