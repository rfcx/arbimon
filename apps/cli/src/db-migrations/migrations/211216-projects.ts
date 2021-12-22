import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

// TODO - Real migrations! (this is just an example stolen from another project)
export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.createTable('projects', {
    id: {
      type: DataTypes.STRING(16),
      allowNull: false,
      primaryKey: true
    },
    stream_id: {
      type: DataTypes.STRING(12),
      allowNull: false
    },
    deployed_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deployment_type: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    created_by_id: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  })

export const down: MigrationFn<QueryInterface> = async (params) => await params.context.dropTable('deployments')
