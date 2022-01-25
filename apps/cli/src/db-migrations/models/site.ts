import { mapValues } from 'lodash-es'
import { DataTypes } from 'sequelize'

import { TABLE_SITES } from '@rfcx-bio/common/dao'

import { getSequelize } from '../helpers'

const sequelize = getSequelize()

export const Site = sequelize.define(
  'Site',
  mapValues({
    id: {
      type: DataTypes.INTEGER, // 1
      primaryKey: true,
      autoIncrement: true
    },
    /** EXTERNAL **/
    id_core: { type: DataTypes.STRING(12) }, // MoLQA8aNulGb
    id_arbimon: { type: DataTypes.INTEGER }, // 8412
    /** DIMENSIONS **/
    location_project_id: { type: DataTypes.INTEGER }, // 1
    /** FACTS **/
    name: { type: DataTypes.STRING(255) }, // 'CU26'
    latitude: { type: DataTypes.FLOAT }, // 18.31307
    longitude: { type: DataTypes.FLOAT }, // -65.24878
    altitude: { type: DataTypes.FLOAT } // 30.85246588
  }, col => ({ allowNull: false, ...col })), // TODO: Extract this (can't work out the right type!)
  {
    tableName: TABLE_SITES
  }
)
