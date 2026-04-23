import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'location_project'

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_entitlement_state_code') THEN
        CREATE TYPE project_entitlement_state_code AS ENUM ('active', 'inactive');
      END IF;
    END $$;
  `)

  await context.sequelize.query(`
    ALTER TABLE "${TABLE_NAME}"
      ADD COLUMN IF NOT EXISTS entitlement_state project_entitlement_state_code NOT NULL DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS entitlement_updated_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS entitlement_inactivated_reason TEXT,
      ADD COLUMN IF NOT EXISTS downgrade_locked BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS view_only_effective BOOLEAN NOT NULL DEFAULT FALSE;
  `)

  await context.sequelize.query(`
    CREATE INDEX IF NOT EXISTS location_project_entitlement_state_idx
      ON "${TABLE_NAME}" (entitlement_state);
    CREATE INDEX IF NOT EXISTS location_project_project_type_idx
      ON "${TABLE_NAME}" (project_type);
  `)

  await context.sequelize.query(`
    COMMENT ON COLUMN "${TABLE_NAME}".entitlement_state IS 'Internal entitlement state. Inactive projects should render as view-only in the UI.';
    COMMENT ON COLUMN "${TABLE_NAME}".entitlement_inactivated_reason IS 'Reason a project became inactive, for example downgrade_over_limit';
    COMMENT ON COLUMN "${TABLE_NAME}".downgrade_locked IS 'True when project state is the result of a downgrade selection outcome';
    COMMENT ON COLUMN "${TABLE_NAME}".view_only_effective IS 'Explicit UI-facing projection of inactive entitlement state';
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`DROP INDEX IF EXISTS location_project_project_type_idx;`)
  await context.sequelize.query(`DROP INDEX IF EXISTS location_project_entitlement_state_idx;`)

  await context.sequelize.query(`
    ALTER TABLE "${TABLE_NAME}"
      DROP COLUMN IF EXISTS view_only_effective,
      DROP COLUMN IF EXISTS downgrade_locked,
      DROP COLUMN IF EXISTS entitlement_inactivated_reason,
      DROP COLUMN IF EXISTS entitlement_updated_at,
      DROP COLUMN IF EXISTS entitlement_state;
  `)

  await context.sequelize.query(`DROP TYPE IF EXISTS project_entitlement_state_code;`)
}
