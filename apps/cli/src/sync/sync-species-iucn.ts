import { getSequelize } from '../db/connections'
import { syncOnlyMissingIUCNSpeciesInfo } from './species-info/iucn'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  await syncOnlyMissingIUCNSpeciesInfo(sequelize)
  process.exit(0)
}

await main()
