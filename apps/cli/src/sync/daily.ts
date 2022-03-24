import { ARBIMON_CONFIG } from '@/data-ingest/_connections/arbimon'
import { syncProjects } from '@/sync/arbimon'
import { syncOnlyMissingIUCNSpeciesInfo } from '@/sync/species-info/iucn'
import { syncOnlyMissingWikiSpeciesInfo } from '@/sync/species-info/wiki'
import { refreshMviews } from '../db/actions/refresh-mviews'
import { getSequelize } from '../db/connections'

const main = async (): Promise<void> => {
  console.info('Daily sync start')
  try {
    const sequelize = getSequelize()

    console.info('STEP: Sync projects')
    await syncProjects(ARBIMON_CONFIG, sequelize)

    console.info('STEP: Sync species description - only for missing or outdated')
    await syncOnlyMissingWikiSpeciesInfo(sequelize)
    await syncOnlyMissingIUCNSpeciesInfo(sequelize)

    console.info('STEP: Refresh mviews')
    await refreshMviews(sequelize)

    console.info('Daily sync end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Daily sync end: failed')
  }
}

await main()
