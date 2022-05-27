import { DataTypes, ModelAttributes } from 'sequelize'

export const TIMESTAMP_COLUMNS: ModelAttributes = {
  created_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}
