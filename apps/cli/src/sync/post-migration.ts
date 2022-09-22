// import { wait } from '@rfcx-bio/utils/async'

// import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
// import { syncAllForProject } from '@/sync/all'
// import { syncProjects } from '@/sync/arbimon'
// import { getNeedSyncingProjects } from '@/sync/data-source'
import { syncOnlyMissingIUCNSpeciesInfo } from '@/sync/species-info/iucn'
import { syncOnlyMissingWikiSpeciesInfo } from '@/sync/species-info/wiki'
import { refreshMviews } from '../db/actions/refresh-mviews'
import { getSequelize } from '../db/connections'

const main = async (): Promise<void> => {
  console.info('Post migration - sync start')
  try {
    const bioSequelize = getSequelize()
    // const arbimonSequelize = getArbimonSequelize()

    // console.info('STEP: Sync projects')
    // await syncProjects(arbimonSequelize, bioSequelize)

    // get syncing projects
    // const syncingProjects = await getNeedSyncingProjects(bioSequelize, 2000)

    // console.info('STEP: Sync site, species, and detections')
    // for (const project of syncingProjects) {
    //   await Promise.all([syncAllForProject(arbimonSequelize, bioSequelize, project), wait(5000)])
    // }

    console.info('STEP: Sync species description - only for missing or outdated')
    await syncOnlyMissingWikiSpeciesInfo(bioSequelize)
    await syncOnlyMissingIUCNSpeciesInfo(bioSequelize)

    console.info('STEP: Refresh mviews')
    await refreshMviews(bioSequelize)

    console.info('Post migration sync end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Post migration sync end: failed')
  }
}

await main()
