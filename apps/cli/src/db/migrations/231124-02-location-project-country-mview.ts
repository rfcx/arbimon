import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const MATERIALIZED_VIEW_NAME = 'location_project_country'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    CREATE MATERIALIZED VIEW ${MATERIALIZED_VIEW_NAME} AS
    SELECT 
      location_project_id, 
      array_agg(country_code) country_codes
    FROM 
      (SELECT DISTINCT 
        location_project_id, 
        country_code 
      FROM location_site 
      WHERE country_code IS NOT NULL 
      ORDER BY country_code) a
    GROUP BY 1
    ;
    `
  )
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`DROP MATERIALIZED VIEW IF EXISTS ${MATERIALIZED_VIEW_NAME}`)
}
