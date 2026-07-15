import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from '@/db/migrations/_helpers/grants'

/**
 * `short_link` — backing store for the `arb.mn` namespaced shortlink surface
 * (rfcx-local `runbooks/DESIGN-arbmn-shortlink-download-service-2026-07-15.md`,
 * OPEN-ITEMS #62).
 *
 * Links are `arb.mn/<namespace>/<slug>` where `<namespace>` is a short (2-char)
 * registry key. The first namespace is `dl` (secure streamed download), used to
 * deliver export/backup files in transactional emails without exposing private
 * MinIO or a raw S3 presigned URL. The unique key is `(namespace, slug)` so each
 * namespace has an independent slug space.
 *
 * `kind` is the resolution behavior: `download` (stream `target_bucket`/
 * `target_key` from storage) or `redirect` (302 to an allow-listed `target_url`).
 */
const TABLE_NAME = 'short_link'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.createTable(
    TABLE_NAME,
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      namespace: {
        type: DataTypes.STRING(8),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      kind: {
        type: DataTypes.STRING(16),
        allowNull: false
      },
      target_bucket: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      target_key: {
        type: DataTypes.STRING(1024),
        allowNull: true
      },
      target_url: {
        type: DataTypes.STRING(2000),
        allowNull: true
      },
      filename: {
        type: DataTypes.STRING(256),
        allowNull: true
      },
      content_type: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      created_by: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      max_accesses: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      access_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      revoked_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }
  )

  // Unique per namespace (independent slug spaces), + a partial index to make
  // the resolver's active-link lookup and the cleanup job cheap.
  await params.context.addIndex(TABLE_NAME, ['namespace', 'slug'], {
    unique: true,
    name: 'short_link_namespace_slug_uq'
  })
  await params.context.addIndex(TABLE_NAME, ['expires_at'], {
    name: 'short_link_expires_at_idx'
  })

  await grant(
    params.context.sequelize,
    TABLE_NAME,
    [GrantPermission.SELECT, GrantPermission.INSERT, GrantPermission.UPDATE],
    DatabaseUser.API
  )
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.dropTable(TABLE_NAME)
}
