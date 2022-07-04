import { Sequelize } from 'sequelize'

import { syncArbimonProjects } from './sync-arbimon-project'

export const syncAllIncrementally = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  try {
    console.info('SYNC - Incremental started')
    const isProjectSyncedUpToDate = await syncArbimonProjects(arbimonSequelize, biodiversitySequelize)
    console.info('- project up to date:', isProjectSyncedUpToDate)

    // wait til project sync is done before sync other things
    if (!isProjectSyncedUpToDate) {
      console.info('- wait to sync more projects in the next round...')
      return
    }

    // TODO: sync other tables
    // sites
    // species
    // ...
    return
  } catch (e) {
    console.error('SYNC - Incremental failed', e)
    process.exitCode = 1
  }
}
