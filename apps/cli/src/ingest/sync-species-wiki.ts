import { getSequelize } from '../db/connections'
import { syncOnlyMissingWikiSpeciesInfo } from './external/wiki'

const main = async (): Promise<void> => {
  console.info('Wiki species sync start')
  try {
    const sequelize = getSequelize()
    await syncOnlyMissingWikiSpeciesInfo(sequelize)
    console.info('Wiki species sync end: successful')
    process.exit(0)
  } catch (e) {
    console.error(e)
    console.info('Wiki species sync end: failed')
    process.exit(1)
  }
}

await main()
