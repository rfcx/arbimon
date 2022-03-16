import { refreshMviews } from '@/db/actions/refresh-mviews'
import { getSequelize } from '@/db/connections'
import { incrementalSync } from '@/sync/all'

const main = async (): Promise<void> => {
  console.info('Hourly sync start')
  try {
    const sequelize = getSequelize()

    await incrementalSync(sequelize)

    console.info('STEP: Refresh mviews')
    await refreshMviews(sequelize)
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Hourly sync end: failed')
  }
}

await main()
