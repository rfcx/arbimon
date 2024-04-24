import { type Sequelize } from 'sequelize'

import { getArbimonProjectId } from './sync-config'
import { syncFixArbimonSites } from './sync-fix-arbimon-site'

export const syncFixProject = async (projectId: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  try {
    console.info('SYNC - Fix project started')

    const idArbimon = await getArbimonProjectId(projectId, biodiversitySequelize)
    const project = { id: projectId, idArbimon }

    await syncFixArbimonSites(project, arbimonSequelize, biodiversitySequelize)
    console.info('> Sites: up to date')
  } catch (e) {
    console.error('SYNC - Fix project failed', e)
    process.exitCode = 1
  }
}
