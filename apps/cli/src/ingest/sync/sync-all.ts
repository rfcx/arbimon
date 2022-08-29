import { Op, Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types/location-project'

import { syncArbimonProjects } from './sync-arbimon-project'
import { syncArbimonRecordingBySiteHour } from './sync-arbimon-recording-by-site-hour'
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

    const bioProjects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
      where: {
        idArbimon: { [Op.in]: [1556] }
      }
    }) as unknown as Project[]

    for (const project of bioProjects) {
      const idArbimon = project.idArbimon
      const projectName = project.name

      const isSiteSyncedUpToDate = await syncArbimonSites(arbimonSequelize, biodiversitySequelize, idArbimon)
      console.info(`> Sites for the project ${projectName}: up to date =`, isSiteSyncedUpToDate)

      if (!isSiteSyncedUpToDate) {
        console.info(`- wait to sync more sites for the project ${projectName} in the next round...`)
        continue
      }

      const isTaxonSpeciesCallsSyncedUpToDate = await syncArbimonSpeciesCalls(arbimonSequelize, biodiversitySequelize, idArbimon)
      console.info(`> Taxon Species Calls for the project ${projectName}: up to date =`, isTaxonSpeciesSyncedUpToDate)

      if (!isTaxonSpeciesCallsSyncedUpToDate) {
        console.info(`- wait to sync more taxon species calls for the project ${projectName} in the next round...`)
        continue
      }

      const isRecordingBySiteHourLessThanMaxLimit = await syncArbimonRecordingBySiteHour(arbimonSequelize, biodiversitySequelize, idArbimon)
      console.info(`> Recordings for the project ${projectName}: less than max limit =`, isRecordingBySiteHourLessThanMaxLimit)

      if (!isRecordingBySiteHourLessThanMaxLimit) {
        console.info(`- wait to sync more recordings  for the project ${projectName} in the next round...`)
        continue
      }

      const isDetectionsBySiteSpeciesHourUpToDate = await syncArbimonDetectionBySiteSpeciesHour(arbimonSequelize, biodiversitySequelize, idArbimon)
      console.info(`> Detections for the project ${projectName}: up to date =`, isDetectionsBySiteSpeciesHourUpToDate)

      if (!isDetectionsBySiteSpeciesHourUpToDate) {
        console.info(`- wait to sync more detections for the project ${projectName} in the next round...`)
        continue
      }
    }

    return
  } catch (e) {
    console.error('SYNC - Incremental failed', e)
    process.exitCode = 1
  }
}
