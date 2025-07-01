import { syncOnlyMissingWikiSpeciesInfo } from '@/ingest/external/wiki'
import { refreshMviews } from '../db/actions/refresh-mviews'
import { getSequelize } from '../db/connections'
import { syncOnlyMissingIUCNSpeciesInfo } from './external/iucn'

const main = async (): Promise<void> => {
  console.info('Daily sync start')
  try {
    const sequelize = getSequelize()

    console.info('STEP: Sync missing IUCN species')
    await syncOnlyMissingIUCNSpeciesInfo(sequelize)
    console.info('STEP: Sync missing Wiki species')
    await syncOnlyMissingWikiSpeciesInfo(sequelize)

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
