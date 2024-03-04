import { getSequelize } from '@/db/connections'
import { syncAllProjects } from './all'
import { getOpenSearchClient } from './opensearch/utilities'

const main = async (): Promise<void> => {
  console.info('Opensearch daily sync start')

  try {
    const opensearchClient = getOpenSearchClient()
    const sequelize = getSequelize()

    await syncAllProjects(opensearchClient, sequelize)
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('opensearch daily sync end: failed')
  }
}

await main()
