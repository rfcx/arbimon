import { getSequelize } from '@/db/connections'
import { getOpenSearchClient } from './opensearch/utilities'
import { recreateIndexes } from './recreate-index'

const main = async (): Promise<void> => {
  console.info('opensearch recreate indexes start')

  try {
    const opensearchClient = getOpenSearchClient()
    const sequelize = getSequelize()
    await recreateIndexes(opensearchClient, sequelize)

    console.info('opensearch recreate indexes done')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('opensearch recreate indexes failed')
  }
}

await main()
