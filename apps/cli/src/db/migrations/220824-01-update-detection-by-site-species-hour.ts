import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'detection_by_site_species_hour'
const VIEW_DBSH = 'detection_by_site_hour'
const VIEW_DDBS = 'dashboard_detection_by_site'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> => {
  return await Promise.all([
    await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_DDBS};`),
    await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_DBSH};`),
    await params.context.changeColumn(
      TABLE_NAME,
      'duration_minutes',
      {
        type: DataTypes.FLOAT
      }
    ),
    await params.context.sequelize.query(
      `
      CREATE VIEW ${VIEW_DBSH} as
      SELECT d.location_project_id,
             d.location_site_id,
             d.time_precision_hour_local,
             sum(d.count) as count,
             max(d.duration_minutes) as duration_minutes
      FROM detection_by_site_species_hour d
      GROUP BY d.location_project_id,
               d.location_site_id,
               d.time_precision_hour_local
      ;
      `
    ),
    await params.context.sequelize.query(
      `
      CREATE VIEW ${VIEW_DDBS} as
      SELECT ls.location_project_id,
             ls.name,
             ls.latitude,
             ls.longitude,
             data.count
      FROM (
          SELECT location_project_id,
                 location_site_id,
                 sum(count)::integer AS count
          FROM detection_by_site_hour
          GROUP BY location_project_id, location_site_id
      ) data
      INNER JOIN location_site ls ON data.location_site_id = ls.id
      ;
      `
    )

  ])
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  return await Promise.all([
    await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_DDBS};`),
    await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_DBSH};`),
    await params.context.changeColumn(
      TABLE_NAME,
      'duration_minutes',
      {
        type: DataTypes.INTEGER
      }
    )
  ])
}
