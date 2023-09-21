import { type Sequelize } from 'sequelize'

import { deleteArbimonRecordingBySiteHour, resyncArbimonRecordingBySiteHourBatch } from './sync-arbimon-recording-by-site-hour'
import { syncArbimonSites } from './sync-arbimon-site'
import { syncArbimonSpeciesCalls } from './sync-arbimon-species-call'
import { deleteArbimonDetectionBySiteSpeciesHour, resyncArbimonDetectionBySiteSpeciesHourBatch } from './sync-arbimon-x-detection-by-site-species-hour'

export const syncProjectData = async (projectId: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  try {
    console.info('RE-SYNC project - started')

    await syncArbimonSites(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Sites: up to date')

    await syncArbimonSpeciesCalls(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Taxon Species Calls: up to date')

    await deleteArbimonRecordingBySiteHour(projectId, biodiversitySequelize)
    await resyncArbimonRecordingBySiteHourBatch(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Recordings: up to date')

    await deleteArbimonDetectionBySiteSpeciesHour(projectId, biodiversitySequelize)
    await resyncArbimonDetectionBySiteSpeciesHourBatch(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Detections: up to date')
  } catch (e) {
    console.error('SYNC - Incremental failed', e)
    process.exitCode = 1
  }
}
