import { execSeeders } from '@/db/actions/exec-seeders'
import { getSequelize } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')
const seederPath = process.argv.find(arg => arg.startsWith('--path='))?.split('=')[1]

const main = async (): Promise<void> => {
  // Validate inputs
  if (!seederPath) {
    console.info('Usage: pnpm serve lib/db/seed -- --path=auto')
    console.info('Usage: pnpm serve lib/db/seed -- --path=optional/name-of-seed.ts')
    return
  }

  // Execute
  const sequelize = getSequelize(verbose)
  await execSeeders(sequelize, seederPath, verbose)
  await sequelize.close()
}

await main()
  .catch(e => console.error(e))
