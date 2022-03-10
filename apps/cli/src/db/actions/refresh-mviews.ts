import { QueryTypes, Sequelize } from 'sequelize'

export const refreshMviews = async (sequelize: Sequelize): Promise<void> => {
  const materializedViews = await sequelize.query<{ view_name: string }>('SELECT matviewname AS view_name FROM pg_matviews', { type: QueryTypes.SELECT })

  console.info('Refreshing materialized views:')
  for (const view of materializedViews) {
    console.info(`- public.${view.view_name}`)
    await sequelize.query(`REFRESH MATERIALIZED VIEW ${view.view_name}`)
  }
}
