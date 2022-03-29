import { syncOnlyMissingIUCNSpeciesInfo } from '@/sync/species-info/iucn'
import { syncOnlyMissingWikiSpeciesInfo } from '@/sync/species-info/wiki'
import { refreshMviews } from '../db/actions/refresh-mviews'
import { getSequelize } from '../db/connections'

const main = async (): Promise<void> => {
  console.info('Species Information - sync start')
  try {
    const bioSequelize = getSequelize()

    console.info('STEP: Sync species description - only for missing or outdated')
    await syncOnlyMissingWikiSpeciesInfo(bioSequelize)
    await syncOnlyMissingIUCNSpeciesInfo(bioSequelize)

    console.info('STEP: Refresh mviews')
    await refreshMviews(bioSequelize)

    console.info('Species Information sync end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Species Information sync end: failed')
  }
}

await main()
