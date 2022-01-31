import { dirname } from 'path'

import { getSequelize, getUmzugSeeder } from './connections'

const currentDir = dirname(new URL(import.meta.url).pathname)
const verbose = process.argv.some(arg => arg === '--verbose')
const filename = process.argv[process.argv.length - 1]

const main = async (): Promise<void> => {
  if (filename.startsWith(currentDir)) {
    console.info('Usage: pnpm serve lib/db/seed name-of-seed-script')
    return
  }

  const sequelize = getSequelize(verbose)
  const umzug = getUmzugSeeder(sequelize, verbose, filename)

  // Run migrations
  await umzug.up().then(res => {
    console.info(`Executed ${res.length} needed migrations`)
    res.forEach(r => console.info(`- ${r.name}`))
  })
  await sequelize.close()
}

await main()
  .catch(e => console.error(e))
