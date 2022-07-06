import { Sequelize } from 'sequelize'

import { syncArbimonProjects } from './sync-arbimon-project'
import { syncArbimonSites } from './sync-arbimon-site'
import { syncArbimonSpecies } from './sync-arbimon-species'

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

    console.info('Project level data:')
    const isSiteSyncedUpToDate = await syncArbimonSites(arbimonSequelize, biodiversitySequelize)
    console.info('> Sites: up to date =', isSiteSyncedUpToDate)

    // wait til taxon species sync is done before sync project level data
    if (!isSiteSyncedUpToDate) {
      console.info('- wait to sync more sites in the next round...')
      return
    }

    // TODO: sync other tables
    // species call
    // recordings
    // detections
    // ...
    return
  } catch (e) {
    console.error('SYNC - Incremental failed', e)
    process.exitCode = 1
  }
}
