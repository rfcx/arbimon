/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface, DataTypes } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { setTimestampDefaults, TIMESTAMP_COLUMNS } from './_helpers/220331-timestamps'

const TABLE_NAME = 'user_profile'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  await params.context.createTable(
    TABLE_NAME,
    {
      // PK
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },

      // SKs
      user_id_auth0: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
      },

      // Facts
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      image: {
        type: DataTypes.STRING(511),
        allowNull: true
      },
      organization_id_affiliated: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      ...TIMESTAMP_COLUMNS
    }
  )
  await setTimestampDefaults(sequelize, TABLE_NAME)
}

export const down: MigrationFn<QueryInterface> = async (params) => { await params.context.dropTable(TABLE_NAME) }
