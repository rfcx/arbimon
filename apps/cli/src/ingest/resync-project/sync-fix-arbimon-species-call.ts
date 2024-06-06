import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Project, type SyncError, type TaxonSpeciesCall } from '@rfcx-bio/node-common/dao/types'

import { getArbimonProjectSpeciesCalls } from '../inputs/get-arbimon-species-call'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { mapSpeciesCallArbimonWithBioFk } from '../parsers/parse-species-call-arbimon-to-bio'
import { getSpeciesCalls } from './get-species-calls'
import { getSyncStatus } from './get-sync-status'

export const syncFixArbimonSpeciesCalls = async (project: Pick<Project, 'id' | 'idArbimon'>, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, verbose: boolean = true): Promise<void> => {
  // Get status
  const syncStatus = await getSyncStatus(biodiversitySequelize, masterSources.Arbimon.id, masterSyncDataTypes.SpeciesCall.id)

  // Getter
  const rawSource = await getArbimonProjectSpeciesCalls(arbimonSequelize, project.idArbimon)
  const source = await Promise.all(await mapSpeciesCallArbimonWithBioFk(rawSource, biodiversitySequelize))
  const target = await getSpeciesCalls(biodiversitySequelize, project.id)
  if (verbose) {
    console.info('- syncFixArbimonSpeciesCalls: found %d species calls in Legacy', rawSource.length)
    console.info('- syncFixArbimonSpeciesCalls: found %d species calls in Bio', target.length)
  }

  // Comparison
  const { additions, updates, deletions } = compare(source, target, verbose)
  const expectedChanges = additions.length + updates.length + deletions.length
  if (verbose) {
    console.info(`- syncFixArbimonSpeciesCalls: expecting ${expectedChanges} updates`)
  }
  if (expectedChanges === 0) {
    return
  }

  // Writer
  const [insertedRows, insertErrors] = await writeAdditions(additions, biodiversitySequelize)
  const [updatedRows, updateErrors] = await writeUpdates(updates, biodiversitySequelize)
  const [deletedRows, deleteErrors] = await writeDeletions(deletions, biodiversitySequelize)
  const actualChanges = insertedRows.length + updatedRows.length + deletedRows.length

  // Write errors
  if (verbose) {
    for (const e of insertErrors) {
      console.warn(`- syncFixArbimonSpeciesCalls: output/insert error: ${JSON.stringify(e)}`)
    }
    for (const e of updateErrors) {
      console.warn(`- syncFixArbimonSpeciesCalls: output/update error: ${JSON.stringify(e)}`)
    }
    for (const e of deleteErrors) {
      console.warn(`- syncFixArbimonSpeciesCalls: output/delete error: ${JSON.stringify(e)}`)
    }
  }
  await Promise.all(insertErrors.concat(updateErrors, deleteErrors).map(async e => {
    const error = { ...e, syncSourceId: syncStatus.syncSourceId, syncDataTypeId: syncStatus.syncDataTypeId }
    await writeSyncError(error, biodiversitySequelize)
  }))

  // Write logs
  if (verbose) {
    console.info(`- syncFixArbimonSpeciesCalls: logging delta ${actualChanges} for ${project.id}`)
  }
  const log = {
    locationProjectId: project.id,
    syncSourceId: syncStatus.syncSourceId,
    syncDataTypeId: syncStatus.syncDataTypeId,
    delta: actualChanges
  }
  await writeSyncLogByProject(log, biodiversitySequelize)
}

interface TaxonSpeciesCallDelta {
  additions: Array<Omit<TaxonSpeciesCall, 'id'>>
  updates: TaxonSpeciesCall[]
  deletions: TaxonSpeciesCall[]
}

const compare = (source: Array<Omit<TaxonSpeciesCall, 'id'>>, target: TaxonSpeciesCall[], verbose: boolean): TaxonSpeciesCallDelta => {
  const additions: Array<Omit<TaxonSpeciesCall, 'id'>> = []
  const updates: TaxonSpeciesCall[] = []
  const deletions: TaxonSpeciesCall[] = []
  let sourceIndex = 0
  let targetIndex = 0

  while (sourceIndex < source.length || targetIndex < target.length) {
    if (sourceIndex >= source.length || (targetIndex < target.length && source[sourceIndex].idArbimon > target[targetIndex].idArbimon)) {
      // Target is next (delete it)
      if (verbose) {
        console.info(`- syncFixArbimonSpeciesCalls: arbimon species call ${target[targetIndex].idArbimon} is deleted`)
      }
      deletions.push(target[targetIndex])
      targetIndex++
    } else if (targetIndex >= target.length || (sourceIndex < source.length && source[sourceIndex].idArbimon < target[targetIndex].idArbimon)) {
      // Source is next (add it)
      if (verbose) {
        console.info(`- syncFixArbimonSpeciesCalls: arbimon species call ${source[sourceIndex].idArbimon} is added`)
      }
      additions.push(source[sourceIndex])
      sourceIndex++
    } else {
      // Process together (update if any fields are different)
      const s = source[sourceIndex]
      const t = target[targetIndex]
      const keyDifferences = Object.keys(s).filter(k => k !== 'callRecordedAt' && s[k as keyof Omit<TaxonSpeciesCall, 'id'>] !== t[k as keyof TaxonSpeciesCall])
        .concat(s.callRecordedAt.getTime() !== t.callRecordedAt.getTime() ? ['callRecordedAt'] : [])
      if (keyDifferences.length > 0) {
        if (verbose) {
          console.info(`- syncFixArbimonSpeciesCalls: arbimon species call ${s.idArbimon} has changed: ${keyDifferences.join(', ')}`)
        }
        updates.push({ ...s, id: t.id })
      }
      sourceIndex++
      targetIndex++
    }
  }

  return { additions, updates, deletions }
}

const loopUpsert = async (rows: Array<Omit<TaxonSpeciesCall, 'id'>>, sequelize: Sequelize): Promise<[Array<Omit<TaxonSpeciesCall, 'id'>>, Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  const successfulItems: Array<Omit<TaxonSpeciesCall, 'id'>> = []
  for (const r of rows) {
    try {
      await ModelRepository.getInstance(sequelize).TaxonSpeciesCall.upsert(r)
      successfulItems.push(r)
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store insert errors
      failedToInsertItems.push({
        externalId: `project:${r.callProjectId}|site:${r.callSiteId}|time:${r.callRecordedAt.toISOString()}|species:${r.taxonSpeciesId}`,
        error: `InsertError: ${errorMessage}`
      })
    }
  }
  return [successfulItems, failedToInsertItems]
}

const writeAdditions = async (rows: Array<Omit<TaxonSpeciesCall, 'id'>>, sequelize: Sequelize): Promise<[Array<Omit<TaxonSpeciesCall, 'id'>>, Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  try {
    await ModelRepository.getInstance(sequelize).TaxonSpeciesCall.bulkCreate(rows)
  } catch (batchInsertError) {
    console.warn('⚠️ Batch insert failed... try loop upsert')
    console.info(batchInsertError)
    return await loopUpsert(rows, sequelize)
  }
  return [rows, []]
}

const writeUpdates = async (rows: TaxonSpeciesCall[], sequelize: Sequelize): Promise<[TaxonSpeciesCall[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const failedItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  const successfulItems: TaxonSpeciesCall[] = []
  for (const r of rows) {
    const { id, ...fields } = r
    try {
      await ModelRepository.getInstance(sequelize).TaxonSpeciesCall.update(fields, { where: { id } })
      successfulItems.push(r)
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store delete errors
      failedItems.push({
        externalId: `project:${r.callProjectId}|site:${r.callSiteId}|time:${r.callRecordedAt.toISOString()}|species:${r.taxonSpeciesId}`,
        error: `DeleteError: ${errorMessage}`
      })
    }
  }
  return [successfulItems, failedItems]
}

const writeDeletions = async (rows: TaxonSpeciesCall[], sequelize: Sequelize): Promise<[TaxonSpeciesCall[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const failedItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  const successfulItems: TaxonSpeciesCall[] = []
  for (const r of rows) {
    try {
      await ModelRepository.getInstance(sequelize).TaxonSpeciesCall.destroy({ where: { id: r.id } })
      successfulItems.push(r)
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store delete errors
      failedItems.push({
        externalId: `project:${r.callProjectId}|site:${r.callSiteId}|time:${r.callRecordedAt.toISOString()}|species:${r.taxonSpeciesId}`,
        error: `DeleteError: ${errorMessage}`
      })
    }
  }
  return [successfulItems, failedItems]
}
