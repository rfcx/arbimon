import { Sequelize } from 'sequelize'

export const refreshMviews = async (sequelize: Sequelize): Promise<void> => {
  const materializedViewsDependencyOrdered = [
    'detection_by_site_hour',
    'location_project_metric',
    'species_in_project',
    'dashboard_richness_by_taxon', // needs species_in_project
    'dashboard_species_highlighted' // needs species_in_project
  ]

  console.info('Refreshing materialized views:')
  for (const view of materializedViewsDependencyOrdered) {
    console.info(`- public.${view}`)
    await sequelize.query(`REFRESH MATERIALIZED VIEW ${view}`)
  }
}
