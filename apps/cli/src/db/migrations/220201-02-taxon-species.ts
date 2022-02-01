/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAME = 'taxon_species'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
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
      // SKs
      id_arbimon: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      // Dimensions
      taxon_class_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      call_project_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      call_site_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      // Facts
      scientific_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      common_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      extinction_risk_rating: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      extinction_risk_rating_source: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      // TODO: Split as a separate table
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      description_source: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description_source_url: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      // TODO: Split as a separate table
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
      // TODO: Split as a separate table
      photo_url: {
        type: DataTypes.STRING(511),
        allowNull: false
      },
      photo_caption: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      photo_author: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      photo_license: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      photo_license_url: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.dropTable(TABLE_NAME)
