import { type Sequelize } from 'sequelize'

import { getArbimonProjectId } from './sync-config'
import { syncFixArbimonDetections } from './sync-fix-arbimon-detection'
import { syncFixArbimonRecordings } from './sync-fix-arbimon-recording'
import { syncFixArbimonSites } from './sync-fix-arbimon-site'
import { syncFixArbimonSpeciesCalls } from './sync-fix-arbimon-species-call'

export const syncFixProject = async (projectId: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  try {
    const idArbimon = await getArbimonProjectId(projectId, biodiversitySequelize)
    const project = { id: projectId, idArbimon }

    await syncFixArbimonSites(project, arbimonSequelize, biodiversitySequelize)
    console.info('> Sites: up to date')

    await syncFixArbimonRecordings(project, arbimonSequelize, biodiversitySequelize)
    console.info('> Recordings: up to date')

    await syncFixArbimonSpeciesCalls(project, arbimonSequelize, biodiversitySequelize)
    console.info('> Species Calls: up to date')

    await syncFixArbimonDetections(project, arbimonSequelize, biodiversitySequelize)
    console.info('> Detections: up to date')
  } catch (e) {
    console.error('SYNC - Fix project failed', e)
    process.exitCode = 1
  }
}
