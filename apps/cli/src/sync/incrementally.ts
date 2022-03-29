import { getArbimonSequelize } from '@/data-ingest/_connections/arbimon'
import { refreshMviews } from '@/db/actions/refresh-mviews'
import { getSequelize } from '@/db/connections'
import { syncAllForProject } from '@/sync/all'
import { getNeedSyncingProjects } from '@/sync/data-source'
import { syncOnlyMissingIUCNSpeciesInfo } from '@/sync/species-info/iucn'
import { syncOnlyMissingWikiSpeciesInfo } from '@/sync/species-info/wiki'

const main = async (): Promise<void> => {
  console.info('Incremental sync start')
  try {
    const arbimonSequelize = getArbimonSequelize()
    const bioSequelize = getSequelize()

    console.info('STEP: Get project lookups')
    const syncingProjects = await getNeedSyncingProjects(bioSequelize)

    console.info('STEP: Sync site, species, and detections')
    for (const project of syncingProjects) {
      await syncAllForProject(arbimonSequelize, bioSequelize, project)
    }

    console.info('STEP: Sync missing Wiki species')
    await syncOnlyMissingWikiSpeciesInfo(bioSequelize)

    console.info('STEP: Sync missing IUCN species')
    await syncOnlyMissingIUCNSpeciesInfo(bioSequelize)

    console.info('STEP: Refresh mviews')
    await refreshMviews(bioSequelize)

    console.info('Incremental sync end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Incremental sync end: failed')
  }
}

await main()
