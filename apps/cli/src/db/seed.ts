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

  // Execute
  const sequelize = getSequelize(verbose)
  for (const seederPath of seederPaths.split(',')) {
    await execSeeders(sequelize, seederPath, verbose)
  }
  await sequelize.close()

  // Refresh mviews
  await refreshMviews(sequelize)
}

await main()
  .catch(e => console.error(e))
