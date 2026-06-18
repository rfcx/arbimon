import { getSequelize } from '../db/connections'
import { syncOnlyMissingIUCNSpeciesInfo } from './external/iucn'

const main = async (): Promise<void> => {
  console.info('IUCN species sync start')
  try {
    const sequelize = getSequelize()
    await syncOnlyMissingIUCNSpeciesInfo(sequelize)
    console.info('IUCN species sync end: successful')
    process.exit(0)
  } catch (e) {
    console.error(e)
    console.info('IUCN species sync end: failed')
    process.exit(1)
  }
}

await main()
