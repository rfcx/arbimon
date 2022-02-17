import { dirname, resolve } from 'path'
import { QueryTypes, Sequelize } from 'sequelize'
import { fileURLToPath } from 'url'

import { getUmzug } from '../connections'

const currentDir = dirname(fileURLToPath(import.meta.url))

export const execSeeders = async (sequelize: Sequelize, seederPath: string, verbose = false): Promise<void> => {
    // Extract CWD & filename
    const fullPath = resolve(currentDir, '../seeders', seederPath)
    const isSingleSeed = fullPath.endsWith('.ts') || fullPath.endsWith('.js')
    const filename = isSingleSeed ? fullPath.slice(0, fullPath.length - 3).split('/').pop() : undefined
    const cwd = isSingleSeed ? fullPath.slice(0, fullPath.lastIndexOf('/')) : fullPath

    // Init umzug
    const umzug = getUmzug(sequelize, verbose, 'seeders', cwd, filename)

    // Run seeders
    const previouslyExecuted = await umzug.executed().then(previousSeeders => previousSeeders.length)
    await umzug.up().then(newSeeders => {
      console.info(`Executed ${newSeeders.length} needed seeders (${previouslyExecuted} previously executed)`)
      newSeeders.forEach(r => console.info(`- ${r.name}`))
    })

    // Refresh materialized views
    const materializedViews = await sequelize.query<{ view_name: string }>('SELECT matviewname AS view_name FROM pg_matviews', { type: QueryTypes.SELECT })
    for (const view of materializedViews) {
      await sequelize.query(`REFRESH MATERIALIZED VIEW ${view.view_name}`)
    }
}
