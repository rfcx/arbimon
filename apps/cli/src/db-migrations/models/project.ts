import { mapValues } from 'lodash-es'
import { DataTypes } from 'sequelize'

import { TABLE_PROJECTS } from '@rfcx-bio/common/dao'

import { getSequelize } from '../connections'

const sequelize = getSequelize()

export const Project = sequelize.define(
  'Project',
  mapValues({
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    /** EXTERNAL **/
    id_core: { type: DataTypes.STRING(12) }, // ???
    id_arbimon: { type: DataTypes.INTEGER }, // ???
    /** FACTS **/
    slug: { type: DataTypes.STRING(255) }, // puerto-rico-island-wide
    name: { type: DataTypes.STRING(255) }, // Puerto Rico Island-Wide
    latitude_north: { type: DataTypes.FLOAT }, // 18.51375
    latitude_south: { type: DataTypes.FLOAT }, // 17.93168
    longitude_east: { type: DataTypes.FLOAT }, // -65.24505
    longitude_west: { type: DataTypes.FLOAT } // -67.94469784
  }, defaultDisallowNull),
  {
    tableName: TABLE_PROJECTS
  }
)
