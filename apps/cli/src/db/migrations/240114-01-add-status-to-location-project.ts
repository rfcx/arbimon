import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'location_project'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.addColumn(TABLE_NAME, 'status', {
      type: DataTypes.ENUM('hidden', 'unlisted', 'listed', 'published'),
      allowNull: false,
      defaultValue: 'unlisted'
  })
  await params.context.addColumn(TABLE_NAME, 'status_updated_at', DataTypes.DATE)

  // Set listed first
  await params.context.sequelize.query(`
    WITH s AS (SELECT location_project_id FROM location_project_metric WHERE recording_minutes_count > 1000)
    UPDATE location_project p SET status = 'listed', status_updated_at = NOW() FROM s WHERE p.id = s.location_project_id;
  `)
  // Then any published projects
  await params.context.sequelize.query(`
    WITH s AS (SELECT location_project_id FROM project_version WHERE is_published = true)
    UPDATE location_project p SET status = 'published', status_updated_at = NOW() FROM s WHERE p.id = s.location_project_id;
  `)

  await params.context.dropTable('project_version')
}
