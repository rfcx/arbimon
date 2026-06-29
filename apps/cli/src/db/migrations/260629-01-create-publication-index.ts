import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const TECHNIQUE_TABLE = 'arbimon_technique'
const PUBLICATION_TABLE = 'publication'
const PUBLICATION_TECHNIQUE_TABLE = 'publication_technique'

const RW = [GrantPermission.SELECT, GrantPermission.INSERT, GrantPermission.UPDATE, GrantPermission.DELETE]

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  // --- extensions (no-op if already present; used for search) ---
  await context.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;')

  // --- enums ---
  await context.sequelize.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publication_citation_tier') THEN
        CREATE TYPE publication_citation_tier AS ENUM ('A', 'B', 'C');
      END IF;
    END $$;
  `)
  await context.sequelize.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publication_review_status') THEN
        CREATE TYPE publication_review_status AS ENUM ('pending', 'approved', 'rejected');
      END IF;
    END $$;
  `)

  // --- technique lookup ---
  await context.sequelize.query(`
    CREATE TABLE IF NOT EXISTS "${TECHNIQUE_TABLE}" (
      code          VARCHAR(40) PRIMARY KEY,
      display_name  VARCHAR(120) NOT NULL,
      abbreviation  VARCHAR(16),
      description   TEXT,
      sort_order    INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await grant(context.sequelize, TECHNIQUE_TABLE, RW, DatabaseUser.API)

  await context.sequelize.query(`
    INSERT INTO "${TECHNIQUE_TABLE}" (code, display_name, abbreviation, description, sort_order) VALUES
      ('pattern_matching', 'Pattern Matching', 'PM', 'Template / cross-correlation detection from one exemplar call.', 1),
      ('rfm', 'Random Forest Model', 'RFM', 'Supervised single-species presence/absence classifier.', 2),
      ('aed', 'Acoustic Event Detection', 'AED', 'Threshold-based automatic acoustic event / ROI detection.', 3),
      ('clustering', 'Clustering / Unsupervised', NULL, 'Feature-based unsupervised grouping of events into call/sound types.', 4),
      ('cnn', 'CNN / Deep Learning', 'CNN', 'Convolutional/neural classifiers on spectrogram ROIs (incl. BirdNET-style).', 5),
      ('soundscape', 'Soundscape / Acoustic Indices', NULL, 'ACI/NDSI/ADI, acoustic space use, and other ecoacoustic indices.', 6),
      ('occupancy', 'Occupancy / Statistical Modeling', NULL, 'Occupancy and detection-probability models built on acoustic detections.', 7),
      ('species_richness', 'Species Richness / Community', NULL, 'Richness, community-composition, and vocal-activity assessments.', 8)
    ON CONFLICT (code) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      abbreviation = EXCLUDED.abbreviation,
      description  = EXCLUDED.description,
      sort_order   = EXCLUDED.sort_order,
      updated_at   = CURRENT_TIMESTAMP;
  `)

  // --- publication ---
  await context.sequelize.query(`
    CREATE TABLE IF NOT EXISTS "${PUBLICATION_TABLE}" (
      id                   SERIAL PRIMARY KEY,
      created_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      title                TEXT NOT NULL,
      publication_year     INTEGER,
      doi                  VARCHAR(255),
      openalex_id          VARCHAR(64),
      semantic_scholar_id  VARCHAR(64),
      external_source_id   VARCHAR(80),
      venue                TEXT,
      publication_type     VARCHAR(64),
      authors              JSONB NOT NULL DEFAULT '[]'::jsonb,
      author_display       TEXT,
      url                  TEXT,
      oa_pdf_url           TEXT,
      cited_by_count       INTEGER,
      citation_tier        publication_citation_tier,
      evidence             TEXT,
      names_arbimon        BOOLEAN NOT NULL DEFAULT FALSE,
      cites_foundational   BOOLEAN NOT NULL DEFAULT FALSE,
      abstract             TEXT,
      abstract_source      VARCHAR(32),
      language             VARCHAR(12),
      is_open_access       BOOLEAN,
      is_preprint          BOOLEAN NOT NULL DEFAULT FALSE,
      fulltext_scanned     BOOLEAN NOT NULL DEFAULT FALSE,
      review_status        publication_review_status NOT NULL DEFAULT 'approved',
      is_visible           BOOLEAN NOT NULL DEFAULT TRUE,
      pdf_s3_bucket        VARCHAR(64),
      pdf_s3_key           VARCHAR(512),
      pdf_license          VARCHAR(64),
      pdf_rights_cleared   BOOLEAN NOT NULL DEFAULT FALSE,
      pdf_bytes            BIGINT,
      source_harvested_at  TIMESTAMPTZ
    );
  `)
  await context.sequelize.query(`CREATE UNIQUE INDEX IF NOT EXISTS publication_doi_key ON "${PUBLICATION_TABLE}" (doi) WHERE doi IS NOT NULL;`)
  await context.sequelize.query(`CREATE UNIQUE INDEX IF NOT EXISTS publication_external_source_id_key ON "${PUBLICATION_TABLE}" (external_source_id) WHERE external_source_id IS NOT NULL;`)
  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS publication_year_idx ON "${PUBLICATION_TABLE}" (publication_year);`)
  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS publication_tier_idx ON "${PUBLICATION_TABLE}" (citation_tier);`)
  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS publication_visibility_idx ON "${PUBLICATION_TABLE}" (review_status, is_visible);`)
  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS publication_authors_gin ON "${PUBLICATION_TABLE}" USING gin (authors);`)
  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS publication_title_trgm ON "${PUBLICATION_TABLE}" USING gin (title gin_trgm_ops);`)
  await grant(context.sequelize, PUBLICATION_TABLE, RW, DatabaseUser.API)

  // --- publication <-> technique join ---
  await context.sequelize.query(`
    CREATE TABLE IF NOT EXISTS "${PUBLICATION_TECHNIQUE_TABLE}" (
      publication_id   INTEGER NOT NULL REFERENCES "${PUBLICATION_TABLE}" (id) ON DELETE CASCADE,
      technique_code   VARCHAR(40) NOT NULL REFERENCES "${TECHNIQUE_TABLE}" (code),
      detection_method VARCHAR(24),
      created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (publication_id, technique_code)
    );
  `)
  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS publication_technique_code_idx ON "${PUBLICATION_TECHNIQUE_TABLE}" (technique_code);`)
  await grant(context.sequelize, PUBLICATION_TECHNIQUE_TABLE, RW, DatabaseUser.API)

  // --- comments ---
  await context.sequelize.query(`
    COMMENT ON TABLE "${TECHNIQUE_TABLE}" IS 'Canonical Arbimon analysis-technique taxonomy (from the ecoacoustics glossary) used to classify publications.';
    COMMENT ON TABLE "${PUBLICATION_TABLE}" IS 'Scientific publications that cite or reference Arbimon; one row per canonical (deduped) work.';
    COMMENT ON COLUMN "${PUBLICATION_TABLE}".citation_tier IS 'Evidence tier: A names Arbimon explicitly; B cites the foundational ARBIMON paper (Aide et al. 2013); C cites another Arbimon-team paper.';
    COMMENT ON COLUMN "${PUBLICATION_TABLE}".abstract_source IS 'Provenance of the abstract text: openalex, crossref, semanticscholar, epmc, html-meta, fulltext-pdf, fulltext-html.';
    COMMENT ON COLUMN "${PUBLICATION_TABLE}".pdf_rights_cleared IS 'TRUE only when license/permission allows us to serve our cached PDF from s3.arbimon.org; otherwise UI links out.';
    COMMENT ON TABLE "${PUBLICATION_TECHNIQUE_TABLE}" IS 'Many-to-many: which Arbimon analysis techniques each publication describes using.';
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`DROP TABLE IF EXISTS "${PUBLICATION_TECHNIQUE_TABLE}";`)
  await context.sequelize.query(`DROP TABLE IF EXISTS "${PUBLICATION_TABLE}";`)
  await context.sequelize.query(`DROP TABLE IF EXISTS "${TECHNIQUE_TABLE}";`)
  await context.sequelize.query('DROP TYPE IF EXISTS publication_review_status;')
  await context.sequelize.query('DROP TYPE IF EXISTS publication_citation_tier;')
}
