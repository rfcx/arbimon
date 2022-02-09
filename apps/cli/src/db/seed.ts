import { dirname, resolve } from 'path'
import { QueryTypes } from 'sequelize'
import { fileURLToPath } from 'url'

import { getSequelize, getUmzug } from './connections'

const verbose = process.argv.some(arg => arg === '--verbose')
const seederPath = process.argv.find(arg => arg.startsWith('--path='))?.split('=')[1]

const currentDir = dirname(fileURLToPath(import.meta.url))

const main = async (): Promise<void> => {
  // Validate inputs
  if (!seederPath) {
    console.info('Usage: pnpm serve lib/db/seed -- --path=auto')
    console.info('Usage: pnpm serve lib/db/seed -- --path=optional/name-of-seed.ts')
    return
  }

  // Extract CWD & filename
  const fullPath = resolve(currentDir, 'seeders', seederPath ?? 'auto')
  const isSingleSeed = fullPath.endsWith('.ts') || fullPath.endsWith('.js')
  const filename = isSingleSeed ? fullPath.slice(0, fullPath.length - 3).split('/').pop() : undefined
  const cwd = isSingleSeed ? fullPath.slice(0, fullPath.lastIndexOf('/')) : fullPath

  // Init sequelize & umzug
  const sequelize = getSequelize(verbose)
  const umzug = getUmzug(sequelize, verbose, cwd, filename)

  // Run seeders
  const previouslyExecuted = await umzug.executed().then(ems => ems.length)
  await umzug.up().then(res => {
    console.info(`Executed ${res.length} needed seeders (${previouslyExecuted} previously executed)`)
    res.forEach(r => console.info(`- ${r.name}`))
  })

  // Refresh materialized views
  const materializedViews = await sequelize.query<{ viewName: string }>('SELECT matviewname AS viewName FROM pg_matviews', { type: QueryTypes.SELECT })
  for (const view of materializedViews) {
    await sequelize.query(`REFRESH MATERIALIZED VIEW ${view.viewName}`)
  }

  await sequelize.close()
}

await main()
  .catch(e => console.error(e))
