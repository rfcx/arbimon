import { getSequelize } from '@/db/connections'
import { syncProjects } from '@/sync/arbimon'
import { getArbimonSequelize } from '@/data-ingest/_connections/arbimon'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  await syncProjects(getArbimonSequelize(), sequelize)
  console.info(`Finished importing projects`)
  process.exit(0)
}

await main()
