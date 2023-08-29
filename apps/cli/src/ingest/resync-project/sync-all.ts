import { type Sequelize } from 'sequelize'

import { resyncArbimonRecordingBySiteHourBatch } from './sync-arbimon-recording-by-site-hour'
import { syncArbimonSites } from './sync-arbimon-site'
import { syncArbimonSpeciesCalls } from './sync-arbimon-species-call'
import { resyncArbimonDetectionBySiteSpeciesHourBatch } from './sync-arbimon-x-detection-by-site-species-hour'

export const syncProjectData = async (projectId: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  try {
    console.info('RE-SYNC project - started')

    await syncArbimonSites(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Sites: up to date')

    await syncArbimonSpeciesCalls(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Taxon Species Calls: up to date')

    await resyncArbimonRecordingBySiteHourBatch(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Recordings: up to date')

    await resyncArbimonDetectionBySiteSpeciesHourBatch(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Detections: up to date')
  } catch (e) {
    console.error('SYNC - Incremental failed', e)
    process.exitCode = 1
  }
}
