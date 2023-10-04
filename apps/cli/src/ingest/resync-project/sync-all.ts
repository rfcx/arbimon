import { type Sequelize } from 'sequelize'

import { deleteArbimonRecordingBySiteHour, resyncArbimonRecordingBySiteHourBatch } from './sync-arbimon-recording-by-site-hour'
import { syncArbimonSites } from './sync-arbimon-site'
import { syncArbimonSpeciesCalls } from './sync-arbimon-species-call'
import { deleteArbimonDetectionBySiteSpeciesHour, resyncArbimonDetectionBySiteSpeciesHourBatch } from './sync-arbimon-x-detection-by-site-species-hour'
import { getBiodiversityProjectId } from './sync-config'

export const syncProjectData = async (projectId: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  try {
    console.info('RE-SYNC project - started')

    await syncArbimonSites(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Sites: up to date')

    await syncArbimonSpeciesCalls(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Taxon Species Calls: up to date')

    const bioProjectId = await getBiodiversityProjectId(projectId, biodiversitySequelize)
    console.info('> bio project id', bioProjectId)

    await deleteArbimonRecordingBySiteHour(bioProjectId, biodiversitySequelize)
    await resyncArbimonRecordingBySiteHourBatch(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Recordings: up to date')

    await deleteArbimonDetectionBySiteSpeciesHour(bioProjectId, biodiversitySequelize)
    await resyncArbimonDetectionBySiteSpeciesHourBatch(projectId, arbimonSequelize, biodiversitySequelize)
    console.info('> Detections: up to date')
  } catch (e) {
    console.error('SYNC - Incremental failed', e)
    process.exitCode = 1
  }
}
