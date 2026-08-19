import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

/**
 * Add `timestamp_formats` to `user_profile`: a user's saved list of custom
 * filename timestamp formats.
 *
 * WHY: the uploader derives a recording's timestamp from its filename. The
 * engine can already parse an explicit %-token format
 * (`parseTimestampWithFormat`) and auto-detects a list of common shapes
 * (`AUTO_PATTERNS`), but a user whose recorder produces a non-auto-detectable
 * name had NO way to express that in the browser — and the "Download for
 * Mac/Windows" links, which used to be the escape hatch, were removed from the
 * prod route on 2026-08-17. Those users currently have no path at all.
 *
 * WHY ON THE PROFILE (operator, 2026-08-18): a filename format is a property of
 * the user's recorder and workflow, not of a project or a browser. The same
 * researcher uploads from the same recorder into many projects for years, and
 * often from more than one machine. Storing the list on the global profile lets
 * the formats be learned ONCE and then applied automatically to every later
 * session — the intent is that a user is simply "pleasantly surprised that their
 * custom formats persist across projects and upload sessions". A per-project or
 * localStorage-scoped setting (the earlier proposal) would have failed both the
 * multi-project and the multi-device case.
 *
 * SHAPE: an ordered list of `{ id, label, format, createdAt }`.
 *   - ORDER IS SEMANTIC. Saved formats AUGMENT auto-detection rather than
 *     replacing it, and the first entry that matches wins (operator decision,
 *     2026-08-18). So this is a list, not a set.
 *   - `label` is required because a bare `%`-token string is unreadable in a
 *     settings list ("AudioMoth field kit" vs "%Y%M%D_%H%I%S").
 *
 * WHY A JSON COLUMN AND NOT A CHILD TABLE: the list is small (capped in the
 * API), wholly owned by one user, order-significant, and only ever read
 * alongside its parent row. A `user_profile_timestamp_format` table would add a
 * join and an ordering column to buy nothing. `DataTypes.JSON` follows the
 * existing precedent in this schema (`data_source.summary_text`,
 * `220311-01-datasource.ts`). If the list ever needs to be shared, audited or
 * queried across users, promote it to a table then.
 *
 * DEFAULT '[]' + NOT NULL: every existing row gets an empty list, so readers
 * never have to handle NULL, and the API can treat "no formats" and "never set
 * any" identically.
 *
 * NOTE FOR THE MODEL: `UPDATE_ON_DUPLICATE_USER_PROFILE` in
 * `packages/node-common/src/dao/models/user-profile-model.ts` must list this
 * column, otherwise an upsert silently drops it.
 */

const TABLE_NAME = 'user_profile'
const COLUMN_NAME = 'timestamp_formats'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.addColumn(TABLE_NAME, COLUMN_NAME, {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  })
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.removeColumn(TABLE_NAME, COLUMN_NAME)
}
