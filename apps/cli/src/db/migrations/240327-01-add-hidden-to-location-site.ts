import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const TABLE_NAME = 'location_site'
const DASHBOARD_VIEW1_NAME = 'dashboard_detection_by_site'
const DASHBOARD_VIEW2_NAME = 'dashboard_richness_by_site'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // Drop dependent views
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${DASHBOARD_VIEW1_NAME}`)
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${DASHBOARD_VIEW2_NAME}`)

  // Update columns
  await params.context.addColumn(TABLE_NAME, 'hidden', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  await params.context.changeColumn(TABLE_NAME, 'latitude', { type: DataTypes.FLOAT, allowNull: true })
  await params.context.changeColumn(TABLE_NAME, 'longitude', { type: DataTypes.FLOAT, allowNull: true })
  await params.context.changeColumn(TABLE_NAME, 'altitude', { type: DataTypes.FLOAT, allowNull: true })

  // Recreate views
  await params.context.sequelize.query(`
    CREATE OR REPLACE VIEW ${DASHBOARD_VIEW1_NAME} AS
    SELECT ls.location_project_id,
           ls.name,
           ls.latitude,
           ls.longitude,
           dbs.count
    FROM detection_by_site dbs
    INNER JOIN location_site ls ON dbs.location_site_id = ls.id
    WHERE ls.hidden = false AND ls.latitude IS NOT NULL`)
  await grant(params.context.sequelize, DASHBOARD_VIEW1_NAME, [GrantPermission.SELECT], DatabaseUser.API)
  await params.context.sequelize.query(`
    DROP VIEW IF EXISTS ${DASHBOARD_VIEW2_NAME};
    CREATE OR REPLACE VIEW ${DASHBOARD_VIEW2_NAME} as
    SELECT ls.location_project_id,
       ls.name,
       ls.longitude,
       ls.latitude,
       richness_by_site.richness,
       richness_by_site.taxon_class_id
    FROM location_site ls
    JOIN (
      SELECT
        detection_by_site_species.location_site_id,
        detection_by_site_species.taxon_class_id as taxon_class_id,
        count(1)::integer as richness
      FROM (
        SELECT location_site_id, taxon_class_id
        FROM detection_by_site_species_hour
        GROUP BY location_site_id, taxon_species_id, taxon_class_id
      ) detection_by_site_species
      GROUP BY location_site_id, taxon_class_id
    ) richness_by_site
    ON ls.id = richness_by_site.location_site_id
    WHERE ls.hidden = false AND ls.latitude IS NOT NULL`)
  await grant(params.context.sequelize, DASHBOARD_VIEW2_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}
