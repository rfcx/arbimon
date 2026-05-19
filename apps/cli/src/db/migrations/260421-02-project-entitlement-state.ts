import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'location_project'

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    ALTER TABLE "${TABLE_NAME}"
      ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;
  `)

  await context.sequelize.query(`
    CREATE INDEX IF NOT EXISTS location_project_project_type_idx
      ON "${TABLE_NAME}" (project_type);
  `)

  await context.sequelize.query(`
    COMMENT ON COLUMN "${TABLE_NAME}".is_locked IS 'Project is locked for tiering-related restrictions such as inactive or over-limit states.';
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query('DROP INDEX IF EXISTS location_project_project_type_idx;')

  await context.sequelize.query(`
    ALTER TABLE "${TABLE_NAME}"
      DROP COLUMN IF EXISTS is_locked;
  `)
}
