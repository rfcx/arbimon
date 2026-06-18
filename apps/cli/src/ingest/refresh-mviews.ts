import { refreshMviews } from '../db/actions/refresh-mviews'
import { getSequelize } from '../db/connections'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()
  await refreshMviews(sequelize)
  process.exit(0)
}

await main()
