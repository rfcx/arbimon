import { getArbimonSequelize } from '@/data-ingest/_connections/arbimon'
import { getSequelize } from '@/db/connections'
import { syncAllIncrementally } from '@/ingest/sync/sync-all'

const main = async (): Promise<void> => {
  console.info('Incremental sync start')
  try {
    const arbimonSequelize = getArbimonSequelize()
    const bioSequelize = getSequelize()

    console.info('STEP: Get projects, species, sites, recordings, detections')
    await syncAllIncrementally(arbimonSequelize, bioSequelize)

    console.info('Incremental sync end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Incremental sync end: failed')
  }
}

await main()
