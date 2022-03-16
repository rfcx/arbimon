import { execSeeders } from '@/db/actions/exec-seeders'
import { refreshMviews } from '@/db/actions/refresh-mviews'
import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')
const seederPaths = process.argv.find(arg => arg.startsWith('--path='))?.split('=')[1]

const main = async (): Promise<void> => {
  // Validate inputs
  if (!seederPaths) {
    console.info('Usage: pnpm serve lib/db/seed -- --path=auto')
    console.info('Usage: pnpm serve lib/db/seed -- --path=optional/name-of-seed.ts')
    return
  }

  // Setup
  const sequelize = getSequelize(verbose)

  // Execute seeders
  for (const seederPath of seederPaths.split(',')) {
    await execSeeders(sequelize, seederPath, verbose)
  }

  // Refresh mviews
  await refreshMviews(sequelize)

  // Teardown
  await sequelize.close()
}

await main()
