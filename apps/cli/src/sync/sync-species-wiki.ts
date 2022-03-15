import { getSequelize } from '../db/connections'
import { syncOnlyMissingWikiSpeciesInfo } from './species-info/wiki'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  await syncOnlyMissingWikiSpeciesInfo(sequelize)
  process.exit(0)
}

await main()
