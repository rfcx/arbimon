import { Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getArbimonSpecies } from '@/ingest/inputs/get-arbimon-species'
import { writeSpeciesToBio } from '@/ingest/outputs/species'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncResult } from '../outputs/sync-status'
import { parseArray } from '../parsers/parse-array'
import { parseSpeciesArbimonToBio, SpeciesArbimon } from '../parsers/parse-species-arbimon-to-bio'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'
import { isSyncable } from './syncable'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.ArbimonValidated.id,
  syncDataTypeId: masterSyncDataTypes.Species.id,
  syncBatchLimit: 1000
}

export const syncArbimonSpeciesBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  const arbimonSpecies = await getArbimonSpecies(arbimonSequelize, syncStatus)
  const taxonClasses = await ModelRepository.getInstance(biodiversitySequelize).TaxonClass.findAll()

  // Exit early if nothing to sync
  if (arbimonSpecies.length === 0) return syncStatus

  // Error if taxon species doesn't contain needed sync status data
  const lastSyncedTaxonSpecies = arbimonSpecies[arbimonSpecies.length - 1]
  if (!isSyncable(lastSyncedTaxonSpecies)) throw new Error('Input does not contain needed sync-status data')

  // Parse input
  const [inputsAndOutputs, inputsAndErrors] = parseArray(arbimonSpecies, parseSpeciesArbimonToBio)
  const species = inputsAndOutputs.map(inputAndOutput => {
    const data = inputAndOutput[1].data
    const taxonClass = taxonClasses.find(cl => cl.idArbimon === inputAndOutput[1].data.taxonClassId)
    return { ...data, taxonClassId: taxonClass?.id }
  })

  const speciesData = species.filter(item => item.taxonClassId !== undefined)

  // Write projects to Bio
  const insertErrors = await writeSpeciesToBio(speciesData as SpeciesArbimon[], biodiversitySequelize)
  const transaction = await biodiversitySequelize.transaction()
  try {
    // Update sync status
    const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: lastSyncedTaxonSpecies.updatedAt, syncUntilId: lastSyncedTaxonSpecies.idArbimon }
    await writeSyncResult(updatedSyncStatus, biodiversitySequelize, transaction)

    // TODO: Log sync errors #809
    if (inputsAndErrors.length > 0) {
      console.error('validation error', inputsAndErrors)
    }

    await Promise.all(insertErrors.map(async e => {
      const error = { ...e, syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId }
      await writeSyncError(error, biodiversitySequelize, transaction)
    }))

    // commit transactions
    await transaction.commit()
    // return sync status
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
