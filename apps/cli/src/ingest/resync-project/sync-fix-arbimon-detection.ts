import { omitBy } from 'lodash-es'
import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { literalizeCountsByMinute } from '@rfcx-bio/node-common/dao/query-helpers/sequelize-literal-integer-array-2d'
import { type DetectionBySiteSpeciesHour, type Project, type SyncError } from '@rfcx-bio/node-common/dao/types'

import { type ArbimonDetectionBySiteSpeciesHour, getArbimonProjectDetectionBySiteSpeciesHours } from '../inputs/get-arbimon-detection'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { type DetectionBySiteSpeciesHourWithArbimonId, getDetectionBySiteSpeciesHours } from './get-detection-by-site-species-hours'
import { getSyncStatus } from './get-sync-status'

const BATCH_SIZE = 10_000

export const syncFixArbimonDetections = async (project: Pick<Project, 'id' | 'idArbimon'>, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, verbose: boolean = true): Promise<void> => {
  // Get status
  const syncStatus = await getSyncStatus(biodiversitySequelize, masterSources.Arbimon.id, masterSyncDataTypes.Recording.id)

  // Getter
  const source: ArbimonDetectionBySiteSpeciesHour[] = []
  console.info('- syncFixArbimonDetections: querying source (legacy)')
  while (true) {
    const rows = await getArbimonProjectDetectionBySiteSpeciesHours(arbimonSequelize, project.idArbimon, syncStatus, BATCH_SIZE, source.length)
    if (rows.length === 0) break
    source.push(...rows)
    if (source.length % (10 * BATCH_SIZE) === 0) {
      console.info(`- syncFixArbimonDetections: querying source ${Math.floor(source.length / BATCH_SIZE)}th batch`)
    }
  }
  console.info('- syncFixArbimonDetections: querying target (bio)')
  const target = (await getDetectionBySiteSpeciesHours(biodiversitySequelize, project.id))
  if (verbose) {
    console.info('- syncFixArbimonDetections: found %d detection site species hours in source (legacy)', source.length)
    console.info('- syncFixArbimonDetections: found %d detection site species hours in target (bio)', target.length)
  }

  // Comparison
  const delta = compare(source, target, verbose)
  const expectedChanges = delta.additions.length + delta.updates.length + delta.deletions.length
  if (verbose) {
    console.info(`- syncFixArbimonDetections: expecting ${expectedChanges} updates`)
  }
  if (expectedChanges === 0) {
    return
  }

  // Writer
  const [insertedRows, insertErrors] = await writeAdditions(delta.additions, biodiversitySequelize)
  const [updatedRows, updateErrors] = await writeAdditions(delta.updates, biodiversitySequelize)
  const [deletedRows, deleteErrors] = await writeDeletions(delta.deletions, biodiversitySequelize)

  const actualChanges = insertedRows.length + updatedRows.length + deletedRows.length

  // Write errors
  if (verbose) {
    for (const e of insertErrors) {
      console.warn(`- syncFixArbimonDetections: output/insert error: ${JSON.stringify(e)}`)
    }
    for (const e of updateErrors) {
      console.warn(`- syncFixArbimonDetections: output/update error: ${JSON.stringify(e)}`)
    }
    for (const e of deleteErrors) {
      console.warn(`- syncFixArbimonDetections: output/delete error: ${JSON.stringify(e)}`)
    }
  }
  await Promise.all(insertErrors.concat(updateErrors, deleteErrors).map(async e => {
    const error = { ...e, syncSourceId: syncStatus.syncSourceId, syncDataTypeId: syncStatus.syncDataTypeId }
    await writeSyncError(error, biodiversitySequelize)
  }))

  // Write logs
  if (verbose) {
    console.info(`- syncFixArbimonDetections: logging delta ${actualChanges} for ${project.id}`)
  }
  const log = {
    locationProjectId: project.id,
    syncSourceId: syncStatus.syncSourceId,
    syncDataTypeId: syncStatus.syncDataTypeId,
    delta: actualChanges
  }
  await writeSyncLogByProject(log, biodiversitySequelize)
}

interface DetectionBySiteSpeciesHourDelta {
  additions: ArbimonDetectionBySiteSpeciesHour[]
  updates: ArbimonDetectionBySiteSpeciesHour[]
  deletions: DetectionBySiteSpeciesHour[]
}

const compare = (source: ArbimonDetectionBySiteSpeciesHour[], target: DetectionBySiteSpeciesHourWithArbimonId[], verbose: boolean): DetectionBySiteSpeciesHourDelta => {
  const changes: DetectionBySiteSpeciesHourDelta = { additions: [], updates: [], deletions: [] }
  let sourceIndex = 0
  let targetIndex = 0

  while (sourceIndex < source.length || targetIndex < target.length) {
    if (sourceIndex >= source.length || (targetIndex < target.length && compareElementBySiteSpeciesHour(source[sourceIndex], target[targetIndex]) === 1)) {
      // Target is next (delete it)
      if (verbose) {
        console.info(`- syncFixArbimonDetections: arbimon site ${target[targetIndex].siteIdArbimon} species ${target[targetIndex].speciesIdArbimon} hour ${target[targetIndex].timePrecisionHourLocal.toISOString()} is deleted`)
      }
      changes.deletions.push(target[targetIndex])
      targetIndex++
    } else if (targetIndex >= target.length || (sourceIndex < source.length && compareElementBySiteSpeciesHour(source[sourceIndex], target[targetIndex]) === -1)) {
      // Source is next (add it)
      if (verbose) {
        console.info(`- syncFixArbimonDetections: arbimon site ${source[sourceIndex].siteIdArbimon} species ${source[sourceIndex].speciesIdArbimon} hour ${source[sourceIndex].timePrecisionHourLocal.toISOString()} is added`)
      }
      changes.additions.push(source[sourceIndex])
      sourceIndex++
    } else {
      // Process together (update if any fields are different)
      const s = source[sourceIndex]
      const t = target[targetIndex]
      const sCounts = s.countsByMinute
      const tCounts = Object.fromEntries(t.countsByMinute)
      const sMissingFromT = omitBy(sCounts, (v, k) => tCounts[Number(k)] === v)
      const tMissingFromS = omitBy(tCounts, (v, k) => sCounts[Number(k)] === v)
      if (Object.keys(sMissingFromT).length > 0 || Object.keys(tMissingFromS).length > 0) {
        if (verbose) {
          console.info(`- syncFixArbimonDetections: arbimon site ${s.siteIdArbimon} species ${s.speciesIdArbimon} hour ${s.timePrecisionHourLocal.toISOString()} has countsByMinute:
            ${Object.entries(sCounts).map(([a, b]) => a + ':' + b.toString()).join(',')}
            ${t.countsByMinute.map(([a, b]) => a.toString() + ':' + b.toString()).join(',')}`)
        }
        changes.updates.push(s)
      }
      sourceIndex++
      targetIndex++
    }
  }

  return changes
}

// -1 => a comes before b, 0 => a equals b
const compareElementBySiteSpeciesHour = (a: ArbimonDetectionBySiteSpeciesHour, b: DetectionBySiteSpeciesHourWithArbimonId): -1 | 0 | 1 => {
  if (a.siteIdArbimon > b.siteIdArbimon ||
    (a.siteIdArbimon === b.siteIdArbimon && a.speciesIdArbimon > b.speciesIdArbimon) ||
    (a.siteIdArbimon === b.siteIdArbimon && a.speciesIdArbimon === b.speciesIdArbimon && a.timePrecisionHourLocal > b.timePrecisionHourLocal)
    ) {
    return 1
  } else if (a.siteIdArbimon < b.siteIdArbimon ||
    (a.siteIdArbimon === b.siteIdArbimon && a.speciesIdArbimon < b.speciesIdArbimon) ||
    (a.siteIdArbimon === b.siteIdArbimon && a.speciesIdArbimon === b.speciesIdArbimon && a.timePrecisionHourLocal < b.timePrecisionHourLocal)
    ) {
    return -1
  }
  return 0
}

const loopUpsert = async (recordings: DetectionBySiteSpeciesHour[], sequelize: Sequelize): Promise<[DetectionBySiteSpeciesHour[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  const successfulItems: DetectionBySiteSpeciesHour[] = []
  for (const r of recordings) {
    try {
      await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.upsert(r)
      successfulItems.push(r)
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store insert errors
      failedToInsertItems.push({
        externalId: `project:${r.locationProjectId}|site:${r.locationSiteId}|time:${r.timePrecisionHourLocal.toISOString()}`,
        error: `InsertError: ${errorMessage}`
      })
    }
  }
  return [successfulItems, failedToInsertItems]
}

const writeAdditions = async (additions: ArbimonDetectionBySiteSpeciesHour[], sequelize: Sequelize): Promise<[DetectionBySiteSpeciesHour[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const { DetectionBySiteSpeciesHour, LocationSite, TaxonSpecies } = ModelRepository.getInstance(sequelize)

  // Get site ids
  const arbimonSiteIds = additions.map(a => a.siteIdArbimon)
  const arbimonAndBioSiteIds = await LocationSite.findAll({ where: { idArbimon: arbimonSiteIds }, attributes: ['idArbimon', 'id', 'locationProjectId'], raw: true })
  const siteMap = Object.fromEntries(arbimonAndBioSiteIds.map(a => [a.idArbimon, { locationSiteId: a.id, locationProjectId: a.locationProjectId }]))
  const arbimonSpeciesIds = additions.map(a => a.speciesIdArbimon)
  const arbimonAndBioSpeciesIds = await TaxonSpecies.findAll({ where: { idArbimon: arbimonSpeciesIds }, attributes: ['idArbimon', 'id', 'taxonClassId'], raw: true })
  const speciesMap = Object.fromEntries(arbimonAndBioSpeciesIds.map(a => [a.idArbimon, { taxonSpeciesId: a.id, taxonClassId: a.taxonClassId }]))

  // Convert objects
  const detectionBySiteSpeciesHours = additions.map(({ siteIdArbimon, speciesIdArbimon, countsByMinute, ...fields }) => {
    return {
      ...fields,
      ...siteMap[siteIdArbimon],
      ...speciesMap[speciesIdArbimon],
      countsByMinute: Object.entries(countsByMinute).map(([a, b]) => [Number(a), b]),
      count: Object.keys(countsByMinute).length
    }
  }).map(r => literalizeCountsByMinute(r, sequelize))

  try {
    await DetectionBySiteSpeciesHour.bulkCreate(detectionBySiteSpeciesHours, { updateOnDuplicate: ['count', 'countsByMinute', 'locationProjectId'] })
  } catch (batchInsertError) {
    console.warn('⚠️ Batch insert failed... try loop upsert')
    console.info(batchInsertError)
    return await loopUpsert(detectionBySiteSpeciesHours, sequelize)
  }

  return [detectionBySiteSpeciesHours, []]
}

// const writeUpdates = async (updates: Record<number, ArbimonDetectionBySiteSpeciesHour[]>, locationProjectId: number, sequelize: Sequelize): Promise<[DetectionBySiteSpeciesHour[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
//   const { DetectionBySiteSpeciesHour } = ModelRepository.getInstance(sequelize)

//   const updatesFlattened = Object.entries(updates).map(([siteId, rows]) => rows.map(({ siteIdArbimon, ...r }) => ({ ...r, locationSiteId: Number(siteId) }))).flat()
//   const detectionBySiteSpeciesHours = updatesFlattened.map(({ countsByMinute, ...fields }) => {
//     return {
//       ...fields,
//       locationProjectId,
//       countsByMinute: Object.entries(countsByMinute).map(([a, b]) => [Number(a), b]),
//       count: Object.keys(countsByMinute).length
//     }
//   }).map(r => literalizeCountsByMinute(r, sequelize))

//   try {
//     await DetectionBySiteSpeciesHour.bulkCreate(detectionBySiteSpeciesHours, { updateOnDuplicate: ['count', 'countsByMinute', 'locationProjectId'] })
//   } catch (batchInsertError) {
//     console.warn('⚠️ Batch upsert failed... try loop upsert')
//     console.info(batchInsertError)
//     return await loopUpsert(detectionBySiteSpeciesHours, sequelize)
//   }

//   return [detectionBySiteSpeciesHours, []]
// }

const writeDeletions = async (deletions: DetectionBySiteSpeciesHour[], sequelize: Sequelize): Promise<[DetectionBySiteSpeciesHour[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const { DetectionBySiteSpeciesHour } = ModelRepository.getInstance(sequelize)

  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  const successfulItems: DetectionBySiteSpeciesHour[] = []
  for (const r of deletions) {
    const where = { locationSiteId: r.locationSiteId, taxonSpeciesId: r.taxonSpeciesId, timePrecisionHourLocal: r.timePrecisionHourLocal }
    try {
      await DetectionBySiteSpeciesHour.destroy({ where })
      successfulItems.push(r)
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store delete errors
      failedToInsertItems.push({
        externalId: `project:${r.locationProjectId}|site:${r.locationSiteId}|species:${r.taxonSpeciesId}|time:${r.timePrecisionHourLocal.toISOString()}`,
        error: `DeleteError: ${errorMessage}`
      })
    }
  }
  return [successfulItems, failedToInsertItems]
}
