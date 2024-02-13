import { getSequelize } from '@/db/connections'
import { getOpenSearchClient } from './opensearch'
import { syncAllProjectsIncrementally } from './sync-incremental'

const main = async (): Promise<void> => {
  console.info('- opensearch incremental reindex start')

  try {
    const opensearchClient = getOpenSearchClient()
    const sequelize = getSequelize()

    await syncAllProjectsIncrementally(opensearchClient, sequelize)
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('- opensearch incremental reindex failed')
  }
}

await main()
