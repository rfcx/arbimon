import { getSequelize } from '@/db/connections'
import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { syncAfterMigration } from '../old-sync/sync-after-migration'

const main = async (): Promise<void> => {
  const arbimonSequelize = getArbimonSequelize()
  const bioSequelize = getSequelize()
  await syncAfterMigration(arbimonSequelize, bioSequelize)
}

await main()
