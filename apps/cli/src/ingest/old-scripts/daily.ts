import { getSequelize } from '@/db/connections'
import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { syncDaily } from '../old-sync/daily'

const main = async (): Promise<void> => {
  const arbimonSequelize = getArbimonSequelize()
  const bioSequelize = getSequelize()
  await syncDaily(arbimonSequelize, bioSequelize)
}

await main()
