import { refreshMviews } from '@/db/actions/refresh-mviews'
import { getSequelize } from '@/db/connections'
import { syncAllForProject } from '@/sync/all'
import { getNeedSyncingProjects } from '@/sync/data-source'
import { syncOnlyMissingIUCNSpeciesInfo } from '@/sync/species-info/iucn'
import { syncOnlyMissingWikiSpeciesInfo } from '@/sync/species-info/wiki'

const main = async (): Promise<void> => {
  console.info('Hourly sync start')
  try {
    const sequelize = getSequelize()

    console.info('STEP: Get project lookups')
    const syncingProjects = await getNeedSyncingProjects(sequelize)

    console.info('STEP: Sync site, species, and detections')
    for (const project of syncingProjects) {
      await syncAllForProject(sequelize, project)
    }

    await syncOnlyMissingWikiSpeciesInfo(sequelize)
    await syncOnlyMissingIUCNSpeciesInfo(sequelize)

    console.info('STEP: Refresh mviews')
    await refreshMviews(sequelize)
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Hourly sync end: failed')
  }
}

await main()
