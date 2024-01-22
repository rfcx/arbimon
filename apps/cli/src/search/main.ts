import { getSequelize } from '../db/connections'
import { fullReindex } from './full-reindex'
import { getOpenSearchClient } from './opensearch'

const main = async (): Promise<void> => {
  console.info('Search full index start')
  try {
    const openSearchClient = getOpenSearchClient()
    const sequelize = getSequelize()

    await fullReindex(openSearchClient, sequelize)

    console.info('Search full index end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Search full index end: failed')
  }
}

await main()
