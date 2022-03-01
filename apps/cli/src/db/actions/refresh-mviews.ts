import { QueryTypes, Sequelize } from 'sequelize'

export const refreshMviews = async (sequelize: Sequelize): Promise<void> => {
  const materializedViews = await sequelize.query<{ view_name: string }>('SELECT matviewname AS view_name FROM pg_matviews', { type: QueryTypes.SELECT })
  for (const view of materializedViews) {
    await sequelize.query(`REFRESH MATERIALIZED VIEW ${view.view_name}`)
  }
}
