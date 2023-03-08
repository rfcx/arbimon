import { type Sequelize, QueryTypes } from 'sequelize'

export const refreshMviews = async (sequelize: Sequelize): Promise<void> => {
  // Prioritize views that have dependencies
  const mvsWithDependencies = [
    'species_in_project'
  ]

  // Get a list of all other views
  const mvsAll = await sequelize.query<{ view_name: string }>('SELECT matviewname AS view_name FROM pg_matviews', { type: QueryTypes.SELECT })
    .then(res => res.map(view => view.view_name))

  // Merge
  const mvsOrdered = [
    ...mvsWithDependencies.filter(mv => mvsAll.includes(mv)), // only if they exist
    ...mvsAll.filter(mv => !mvsWithDependencies.includes(mv)) // only if they aren't listed above
  ]

  // Refresh in order
  console.info('Refreshing materialized views:')
  for (const view of mvsOrdered) {
    console.info(`- public.${view}`)
    await sequelize.query(`REFRESH MATERIALIZED VIEW ${view}`)
  }
}
