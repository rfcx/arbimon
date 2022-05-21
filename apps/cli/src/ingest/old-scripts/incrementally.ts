import { getSequelize } from '@/db/connections'
import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { syncIncremental } from '../old-sync/incremental'

const main = async (): Promise<void> => {
  const arbimonSequelize = getArbimonSequelize()
  const bioSequelize = getSequelize()
  await syncIncremental(arbimonSequelize, bioSequelize)
}

await main()
