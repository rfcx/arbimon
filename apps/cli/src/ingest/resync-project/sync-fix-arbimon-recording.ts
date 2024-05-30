import { omitBy } from 'lodash-es'
import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { literalizeCountsByMinute } from '@rfcx-bio/node-common/dao/query-helpers/sequelize-literal-integer-array-2d'
import { type Project, type RecordingBySiteHour, type SyncError } from '@rfcx-bio/node-common/dao/types'

import { type ArbimonRecordingByHour, getArbimonProjectRecordingsBySiteHour } from '../inputs/get-arbimon-recording'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { type RecordingBySiteHourWithArbimonSiteId, getRecordingBySiteHours } from './get-recording-by-site-hours'
import { getSyncStatus } from './get-sync-status'

const BATCH_SIZE = 10_000

export const syncFixArbimonRecordings = async (project: Pick<Project, 'id' | 'idArbimon'>, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, verbose: boolean = true): Promise<void> => {
  // Get status
  const syncStatus = await getSyncStatus(biodiversitySequelize, masterSources.Arbimon.id, masterSyncDataTypes.Recording.id)

  // Getter
  const source: ArbimonRecordingByHour[] = []
  console.info('- syncFixArbimonRecordings: querying source (legacy)')
  while (true) {
    const rows = await getArbimonProjectRecordingsBySiteHour(arbimonSequelize, project.idArbimon, syncStatus, BATCH_SIZE, source.length)
    if (rows.length === 0) break
    source.push(...rows)
    if (source.length % (10 * BATCH_SIZE) === 0) {
      console.info(`- syncFixArbimonRecordings: querying source ${Math.floor(source.length / BATCH_SIZE)}th batch`)
    }
  }
  console.info('- syncFixArbimonRecordings: querying target (bio)')
  const target = (await getRecordingBySiteHours(biodiversitySequelize, project.id))
  if (verbose) {
    console.info('- syncFixArbimonRecordings: found %d site recording hours in source (legacy)', source.length)
    console.info('- syncFixArbimonRecordings: found %d site recording hours in target (bio)', target.length)
  }

  // Comparison
  const delta = compare(source, target, verbose)
  const expectedChanges = delta.additions.length + Object.values(delta.updates).flat().length + delta.deletions.length
  if (verbose) {
    console.info(`- syncFixArbimonRecordings: expecting ${expectedChanges} updates`)
  }
  if (expectedChanges === 0) {
    return
  }

  // Writer
  const [insertedRows, insertErrors] = await writeAdditions(delta.additions, biodiversitySequelize)
  const [updatedRows, updateErrors] = await writeUpdates(delta.updates, project.id, biodiversitySequelize)
  const [deletedRows, deleteErrors] = await writeDeletions(delta.deletions, biodiversitySequelize)

  const actualChanges = insertedRows.length + updatedRows.length + deletedRows.length

  // Write errors
  if (verbose) {
    for (const e of insertErrors) {
      console.warn(`- syncFixArbimonRecordings: output/insert error: ${JSON.stringify(e)}`)
    }
    for (const e of updateErrors) {
      console.warn(`- syncFixArbimonRecordings: output/update error: ${JSON.stringify(e)}`)
    }
    for (const e of deleteErrors) {
      console.warn(`- syncFixArbimonRecordings: output/delete error: ${JSON.stringify(e)}`)
    }
  }
  await Promise.all(insertErrors.concat(updateErrors, deleteErrors).map(async e => {
    const error = { ...e, syncSourceId: syncStatus.syncSourceId, syncDataTypeId: syncStatus.syncDataTypeId }
    await writeSyncError(error, biodiversitySequelize)
  }))

  // Write logs
  if (verbose) {
    console.info(`- syncFixArbimonRecordings: logging delta ${actualChanges} for ${project.id}`)
  }
  const log = {
    locationProjectId: project.id,
    syncSourceId: syncStatus.syncSourceId,
    syncDataTypeId: syncStatus.syncDataTypeId,
    delta: actualChanges
  }
  await writeSyncLogByProject(log, biodiversitySequelize)
}

interface RecordingBySiteHourDelta {
  additions: ArbimonRecordingByHour[]
  updates: Record<number, ArbimonRecordingByHour[]>
  deletions: RecordingBySiteHour[]
}

const compare = (source: ArbimonRecordingByHour[], target: RecordingBySiteHourWithArbimonSiteId[], verbose: boolean): RecordingBySiteHourDelta => {
  const changes: RecordingBySiteHourDelta = { additions: [], updates: {}, deletions: [] }
  let sourceIndex = 0
  let targetIndex = 0

  while (sourceIndex < source.length || targetIndex < target.length) {
    if (sourceIndex >= source.length || (targetIndex < target.length && compareElementBySiteHour(source[sourceIndex], target[targetIndex]) === 1)) {
      // Target is next (delete it)
      if (verbose) {
        console.info(`- syncFixArbimonRecordings: arbimon site ${target[targetIndex].siteIdArbimon} hour ${target[targetIndex].timePrecisionHourLocal.toISOString()} is deleted`)
      }
      changes.deletions.push(target[targetIndex])
      targetIndex++
    } else if (targetIndex >= target.length || (sourceIndex < source.length && compareElementBySiteHour(source[sourceIndex], target[targetIndex]) === -1)) {
      // Source is next (add it)
      if (verbose) {
        console.info(`- syncFixArbimonRecordings: arbimon site ${source[sourceIndex].siteIdArbimon} hour ${source[sourceIndex].timePrecisionHourLocal.toISOString()} is added`)
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
      if (Object.keys(sMissingFromT).length > 0 || Object.keys(tMissingFromS).length > 0 || Math.abs(s.totalDurationInMinutes - t.totalDurationInMinutes) > 0.1) {
        if (verbose) {
          if (Object.keys(sMissingFromT).length > 0 || Object.keys(tMissingFromS).length > 0) {
            console.info(`- syncFixArbimonRecordings: arbimon site ${s.siteIdArbimon} hour ${s.timePrecisionHourLocal.toISOString()} has countsByMinute:
              ${Object.entries(sCounts).map(([a, b]) => a + ':' + b.toString()).join(',')}
              ${t.countsByMinute.map(([a, b]) => a.toString() + ':' + b.toString()).join(',')}`)
          }
          if (Math.abs(s.totalDurationInMinutes - t.totalDurationInMinutes) > 0.1) {
            console.info(`- syncFixArbimonRecordings: arbimon site ${s.siteIdArbimon} hour ${s.timePrecisionHourLocal.toISOString()} has total duration ${s.totalDurationInMinutes} vs ${t.totalDurationInMinutes}`)
          }
        }
        if (changes.updates[t.locationSiteId] === undefined) changes.updates[t.locationSiteId] = []
        changes.updates[t.locationSiteId].push(s)
      }
      sourceIndex++
      targetIndex++
    }
  }

  return changes
}

// -1 => a comes before b, 0 => a equals b
const compareElementBySiteHour = (a: ArbimonRecordingByHour, b: RecordingBySiteHourWithArbimonSiteId): -1 | 0 | 1 => {
  if (a.siteIdArbimon > b.siteIdArbimon || (a.siteIdArbimon === b.siteIdArbimon && a.timePrecisionHourLocal > b.timePrecisionHourLocal)) {
    return 1
  } else if (a.siteIdArbimon < b.siteIdArbimon || (a.siteIdArbimon === b.siteIdArbimon && a.timePrecisionHourLocal < b.timePrecisionHourLocal)) {
    return -1
  }
  return 0
}

const loopUpsert = async (recordings: RecordingBySiteHour[], sequelize: Sequelize): Promise<[RecordingBySiteHour[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  const successfulItems: RecordingBySiteHour[] = []
  for (const r of recordings) {
    try {
      await ModelRepository.getInstance(sequelize).RecordingBySiteHour.upsert(r)
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

const writeAdditions = async (additions: ArbimonRecordingByHour[], sequelize: Sequelize): Promise<[RecordingBySiteHour[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const { RecordingBySiteHour, LocationSite } = ModelRepository.getInstance(sequelize)

  // Get site ids
  const arbimonSiteIds = additions.map(a => a.siteIdArbimon)
  const arbimonAndBioSiteIds = await LocationSite.findAll({ where: { idArbimon: arbimonSiteIds }, attributes: ['idArbimon', 'id', 'locationProjectId'], raw: true })
  const siteMap = Object.fromEntries(arbimonAndBioSiteIds.map(a => [a.idArbimon, { locationSiteId: a.id, locationProjectId: a.locationProjectId }]))

  // Convert objects
  const recordingsBySiteHour = additions.map(({ siteIdArbimon, countsByMinute, ...fields }) => {
    return {
      ...fields,
      ...siteMap[siteIdArbimon],
      countsByMinute: Object.entries(countsByMinute).map(([a, b]) => [Number(a), b]),
      count: Object.keys(countsByMinute).length
    }
  }).map(r => literalizeCountsByMinute(r, sequelize))

  try {
    await RecordingBySiteHour.bulkCreate(recordingsBySiteHour, { updateOnDuplicate: ['count', 'countsByMinute', 'totalDurationInMinutes', 'locationProjectId'] })
  } catch (batchInsertError) {
    console.warn('⚠️ Batch insert failed... try loop upsert')
    console.info(batchInsertError)
    return await loopUpsert(recordingsBySiteHour, sequelize)
  }

  return [recordingsBySiteHour, []]
}

const writeUpdates = async (updates: Record<number, ArbimonRecordingByHour[]>, locationProjectId: number, sequelize: Sequelize): Promise<[RecordingBySiteHour[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const { RecordingBySiteHour } = ModelRepository.getInstance(sequelize)

  const updatesFlattened = Object.entries(updates).map(([siteId, rows]) => rows.map(({ siteIdArbimon, ...r }) => ({ ...r, locationSiteId: Number(siteId) }))).flat()
  const recordingsBySiteHour = updatesFlattened.map(({ countsByMinute, ...fields }) => {
    return {
      ...fields,
      locationProjectId,
      countsByMinute: Object.entries(countsByMinute).map(([a, b]) => [Number(a), b]),
      count: Object.keys(countsByMinute).length
    }
  }).map(r => literalizeCountsByMinute(r, sequelize))

  try {
    await RecordingBySiteHour.bulkCreate(recordingsBySiteHour, { updateOnDuplicate: ['count', 'countsByMinute', 'totalDurationInMinutes', 'locationProjectId'] })
  } catch (batchInsertError) {
    console.warn('⚠️ Batch upsert failed... try loop upsert')
    console.info(batchInsertError)
    return await loopUpsert(recordingsBySiteHour, sequelize)
  }

  return [recordingsBySiteHour, []]
}

const writeDeletions = async (deletions: RecordingBySiteHour[], sequelize: Sequelize): Promise<[RecordingBySiteHour[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const { RecordingBySiteHour } = ModelRepository.getInstance(sequelize)

  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  const successfulItems: RecordingBySiteHour[] = []
  for (const r of deletions) {
    const where = { locationSiteId: r.locationSiteId, timePrecisionHourLocal: r.timePrecisionHourLocal }
    try {
      await RecordingBySiteHour.destroy({ where })
      successfulItems.push(r)
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store delete errors
      failedToInsertItems.push({
        externalId: `project:${r.locationProjectId}|site:${r.locationSiteId}|time:${r.timePrecisionHourLocal.toISOString()}`,
        error: `DeleteError: ${errorMessage}`
      })
    }
  }
  return [successfulItems, failedToInsertItems]
}
