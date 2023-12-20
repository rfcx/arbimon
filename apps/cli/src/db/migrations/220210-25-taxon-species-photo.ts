/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const TABLE_NAME = 'taxon_species_photo'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
 await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      taxon_species_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: { tableName: 'taxon_species' },
          key: 'id'
        }
      },
      source: {
        type: DataTypes.STRING(255),
        primaryKey: true
      },
      // Logging
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      // Facts
      photo_url: {
        type: DataTypes.STRING(511),
        allowNull: false
      },
      photo_caption: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      photo_author: {
        type: DataTypes.STRING(1023),
        allowNull: false
      },
      photo_license: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      photo_license_url: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }
  )
  await grant(params.context.sequelize, TABLE_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params) => { await params.context.dropTable(TABLE_NAME) }
