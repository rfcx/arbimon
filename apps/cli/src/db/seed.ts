import { execSeeders, refreshMviews } from './_helpers'
import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')
const seederPaths = process.argv
  .find(arg => arg.startsWith('--path='))
  ?.split('=')[1]
  ?.split(',')

const main = async (): Promise<void> => {
  // Validate inputs
  if (!seederPaths) {
    console.info('Usage: pnpm serve lib/db/seed -- --path=auto')
    console.info('Usage: pnpm serve lib/db/seed -- --path=optional/name-of-seed.ts')
    return
  }

  const sequelize = getSequelize(verbose)

  for (const path of seederPaths) { await execSeeders(sequelize, path, verbose) }
  await refreshMviews(sequelize)

  await sequelize.close()
}

await main()
