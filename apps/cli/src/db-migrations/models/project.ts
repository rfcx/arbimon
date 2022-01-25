import { mapValues } from 'lodash-es'
import { DataTypes } from 'sequelize'

import { Project } from '@rfcx-bio/common/api-bio/common/projects'
import { TABLE_PROJECTS } from '@rfcx-bio/common/dao'

import { getSequelize } from '../connections'
import { defaultDisallowNull, ModelForInterface } from '../helpers'

const sequelize = getSequelize()

export const ProjectDao = sequelize.define<ModelForInterface<Project>>(
  'Project',
  mapValues({
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // External
    idCore: { type: DataTypes.STRING(12) }, // ???
    idArbimon: { type: DataTypes.INTEGER }, // ???
    // Facts
    slug: { type: DataTypes.STRING(255) }, // puerto-rico-island-wide
    name: { type: DataTypes.STRING(255) }, // Puerto Rico Island-Wide
    latitudeNorth: { type: DataTypes.FLOAT }, // 18.51375
    latitudeSouth: { type: DataTypes.FLOAT }, // 17.93168
    longitudeEast: { type: DataTypes.FLOAT }, // -65.24505
    longitudeWest: { type: DataTypes.FLOAT } // -67.94469784
  }, defaultDisallowNull),
  {
    tableName: TABLE_PROJECTS
  }
)
