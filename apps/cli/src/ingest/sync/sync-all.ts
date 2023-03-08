import { type Sequelize } from 'sequelize'

import { syncArbimonProjects } from './sync-arbimon-project'
import { syncArbimonRecordingBySiteHour } from './sync-arbimon-recording-by-site-hour'
import { syncArbimonRecordingDeleted } from './sync-arbimon-recording-deleted'
import { syncArbimonSites } from './sync-arbimon-site'
import { syncArbimonSpecies } from './sync-arbimon-species'
import { syncArbimonSpeciesCalls } from './sync-arbimon-species-call'
import { syncArbimonDetectionBySiteSpeciesHour } from './sync-arbimon-x-detection-by-site-species-hour'

export const syncAllIncrementally = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  try {
    console.info('SYNC - Incremental started')

    console.info('Master data:')
    const isProjectSyncedUpToDate = await syncArbimonProjects(arbimonSequelize, biodiversitySequelize)
    console.info('> Projects: up to date =', isProjectSyncedUpToDate)

    // wait til project sync is done before sync other things
    if (!isProjectSyncedUpToDate) {
      console.info('- wait to sync more projects in the next round...')
      return
    }

    const isTaxonSpeciesSyncedUpToDate = await syncArbimonSpecies(arbimonSequelize, biodiversitySequelize)
    console.info('> Taxon Species: up to date =', isTaxonSpeciesSyncedUpToDate)

    // wait til taxon species sync is done before sync project level data
    if (!isTaxonSpeciesSyncedUpToDate) {
      console.info('- wait to sync more taxon species in the next round...')
      return
    }

    console.info('\nProject level data:\n')

    const isSiteSyncedUpToDate = await syncArbimonSites(arbimonSequelize, biodiversitySequelize)
    console.info('> Sites: up to date =', isSiteSyncedUpToDate)

    if (!isSiteSyncedUpToDate) {
      console.info('- wait to sync more sites in the next round...')
      return
    }

    const isTaxonSpeciesCallsSyncedUpToDate = await syncArbimonSpeciesCalls(arbimonSequelize, biodiversitySequelize)
    console.info('> Taxon Species Calls: up to date =', isTaxonSpeciesSyncedUpToDate)

    if (!isTaxonSpeciesCallsSyncedUpToDate) {
      console.info('- wait to sync more taxon species calls in the next round...')
      return
    }

    const isRecordingBySiteHourLessThanMaxLimit = await syncArbimonRecordingBySiteHour(arbimonSequelize, biodiversitySequelize)
    console.info('> Recordings: less than max limit =', isRecordingBySiteHourLessThanMaxLimit)

    if (!isRecordingBySiteHourLessThanMaxLimit) {
      console.info('- wait to sync more recordings in the next round...')
      return
    }

    const isDetectionsBySiteSpeciesHourLessThanMaxLimit = await syncArbimonDetectionBySiteSpeciesHour(arbimonSequelize, biodiversitySequelize)
    console.info('> Detections: less than max limit =', isDetectionsBySiteSpeciesHourLessThanMaxLimit)

    if (!isDetectionsBySiteSpeciesHourLessThanMaxLimit) {
      console.info('- wait to sync more detections in the next round...')
      return
    }

    const isRecordingDeletedUpToDate = await syncArbimonRecordingDeleted(arbimonSequelize, biodiversitySequelize)
    console.info('> Recording Deleted: up to date =', isRecordingDeletedUpToDate)

    if (!isRecordingDeletedUpToDate) {
      console.info('- wait to sync more deleted recordings in the next round...')
      return
    }

    return
  } catch (e) {
    console.error('SYNC - Incremental failed', e)
    process.exitCode = 1
  }
}
