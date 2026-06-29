import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const PUBLICATION_TABLE = 'publication'

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    ALTER TABLE "${PUBLICATION_TABLE}"
      ADD COLUMN IF NOT EXISTS is_rfcx_authored BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS rfcx_curated_uses TEXT,
      ADD COLUMN IF NOT EXISTS sheet_mention_type VARCHAR(32),
      ADD COLUMN IF NOT EXISTS in_rfcx_curated_list BOOLEAN NOT NULL DEFAULT FALSE;
  `)

  await context.sequelize.query(`
    COMMENT ON COLUMN "${PUBLICATION_TABLE}".is_rfcx_authored IS 'Authored/co-authored by an RFCx/Arbimon team member (from the RFCx-curated publications list).';
    COMMENT ON COLUMN "${PUBLICATION_TABLE}".rfcx_curated_uses IS 'Human-curated description of how the paper used the platform, e.g. "Arbimon (storage, PM, RFM)", "LG recorders". From the RFCx publications spreadsheet; authoritative over inferred technique tags.';
    COMMENT ON COLUMN "${PUBLICATION_TABLE}".sheet_mention_type IS 'RFCx-curated relationship class: Use / Mention / Co-author.';
    COMMENT ON COLUMN "${PUBLICATION_TABLE}".in_rfcx_curated_list IS 'Present in the hand-curated RFCx publications list (the legacy Google Sheet that /landing/publications used).';
  `)

  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS publication_rfcx_authored_idx ON "${PUBLICATION_TABLE}" (is_rfcx_authored) WHERE is_rfcx_authored;`)
  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS publication_rfcx_curated_idx ON "${PUBLICATION_TABLE}" (in_rfcx_curated_list) WHERE in_rfcx_curated_list;`)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    ALTER TABLE "${PUBLICATION_TABLE}"
      DROP COLUMN IF EXISTS in_rfcx_curated_list,
      DROP COLUMN IF EXISTS sheet_mention_type,
      DROP COLUMN IF EXISTS rfcx_curated_uses,
      DROP COLUMN IF EXISTS is_rfcx_authored;
  `)
}
