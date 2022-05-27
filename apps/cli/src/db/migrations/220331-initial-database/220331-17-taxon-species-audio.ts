/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TIMESTAMP_COLUMNS } from '../_helpers/220331-timestamps'

const TABLE_NAME = 'taxon_species_audio'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
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
      order: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: 1
      },
      ...TIMESTAMP_COLUMNS,

      // FKs
      recording_project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'project' },
          key: 'id'
        }
      },
      recording_project_site_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'project_site' },
          key: 'id'
        }
      },

      // Facts
      source_url: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      audio_url: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      spectrogram_url: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      song_type: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      recorded_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      timezone: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
