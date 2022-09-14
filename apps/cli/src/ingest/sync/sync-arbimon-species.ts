import { Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'
import { urlify } from '@rfcx-bio/utils/url-helpers'

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
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Species.id,
  syncBatchLimit: 200000
}

export const syncArbimonSpeciesBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  const arbimonSpecies = await getArbimonSpecies(arbimonSequelize, syncStatus)
  console.info('- syncArbimonSpeciesBatch: from', syncStatus.syncUntilId, syncStatus.syncUntilDate)
  console.info('- syncArbimonSpeciesBatch: found %d species', arbimonSpecies.length)
  // Exit early if nothing to sync
  if (arbimonSpecies.length === 0) return syncStatus
  const taxonClasses = await ModelRepository.getInstance(biodiversitySequelize).TaxonClass.findAll()

  // Error if taxon species doesn't contain needed sync status data
  const lastSyncedTaxonSpecies = arbimonSpecies[arbimonSpecies.length - 1]
  if (!isSyncable(lastSyncedTaxonSpecies)) throw new Error('Input does not contain needed sync-status data')

  // Parse input
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(arbimonSpecies.map(item => {
    return { ...item, slug: urlify(item.scientificName) }
  }), parseSpeciesArbimonToBio)
  const filteredSpecies = inputsAndOutputs.filter(inputAndOutput => {
    const taxonClass = taxonClasses.find(cl => cl.idArbimon === inputAndOutput[1].data.taxonClassId)
    return taxonClass?.id !== undefined
  })
  const species = filteredSpecies.map(inputAndOutput => {
    const data = inputAndOutput[1].data
    const taxonClass = taxonClasses.find(cl => cl.idArbimon === inputAndOutput[1].data.taxonClassId)
    return { ...data, taxonClassId: taxonClass?.id }
  })

  // Write species to Bio
  const insertErrors = await writeSpeciesToBio(species as SpeciesArbimon[], biodiversitySequelize)
  const transaction = await biodiversitySequelize.transaction()
  try {
    // Update sync status
    const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: lastSyncedTaxonSpecies.updatedAt, syncUntilId: lastSyncedTaxonSpecies.idArbimon.toString() }
    await writeSyncResult(updatedSyncStatus, biodiversitySequelize, transaction)

    await Promise.all(inputsAndParsingErrors.map(async e => {
      const idArbimon = isSyncable(e[0]) ? e[0].idArbimon : 'unknown'
      const error = {
        externalId: `${idArbimon}`,
        error: 'ValidationError: ' + JSON.stringify(e[1].error.issues),
        syncSourceId: updatedSyncStatus.syncSourceId,
        syncDataTypeId: updatedSyncStatus.syncDataTypeId
      }
      await writeSyncError(error, biodiversitySequelize, transaction)
    }))

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

export const syncArbimonSpecies = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<boolean> => {
  const syncStatus = await ModelRepository.getInstance(getSequelize())
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

  const updatedSyncStatus = await syncArbimonSpeciesBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
  return (syncStatus.syncUntilDate === updatedSyncStatus.syncUntilDate && syncStatus.syncUntilId === updatedSyncStatus.syncUntilId)
}
