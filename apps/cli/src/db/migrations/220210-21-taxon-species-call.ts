/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

const TABLE_NAME = 'taxon_species_call'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
 await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      // Dimensions
      taxon_species_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'taxon_species' },
          key: 'id'
        }
      },
      call_project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'location_project' },
          key: 'id'
        }
      },
      call_site_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'location_site' },
          key: 'id'
        }
      },
      // Facts
      call_type: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      call_recorded_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      call_timezone: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      call_media_wav_url: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      call_media_spec_url: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      call_media_redirect_url: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }
  )
}

export const down: MigrationFn<QueryInterface> = async (params) => { await params.context.dropTable(TABLE_NAME) }
