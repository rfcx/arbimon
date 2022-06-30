import { Sequelize } from 'sequelize'

import { syncArbimonProjects } from './sync-arbimon-project'

const exitWithSuccess = (): void => {
  exitWithInfoMessage('SYNC - Incrementally finished!')
}

const exitWithInfoMessage = (message: string): void => {
  console.info(message)
  process.exit(0)
}

export const syncAllIncrementally = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  try {
    console.info('SYNC - Incrementally started')
    const isProjectSyncedUpToDate = await syncArbimonProjects(arbimonSequelize, biodiversitySequelize)
    console.info('- project up to date:', isProjectSyncedUpToDate)

    // wait til project sync is done before sync other things
    if (!isProjectSyncedUpToDate) {
      console.info('- wait to sync more projects in the next round...')
      exitWithSuccess()
      return
    }

    // TODO: sync other tables
    // sites
    // species
    // ...
    exitWithSuccess()
  } catch (e) {
    console.error(e)
    process.exit(0)
  }
}
