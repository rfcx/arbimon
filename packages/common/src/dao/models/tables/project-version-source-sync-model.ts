import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { ProjectVersionSourceSync } from '../../types'

export const MODEL_PROJECT_VERSION_SOURCE_SYNC = 'ProjectVersionSourceSync'
const TABLE_PROJECT_VERSION_SOURCE_SYNC = 'project_version_source_sync'

// TODO: Maybe don't need this as a type/model (just declare many-to-many relation)
export const ProjectVersionSourceSyncModel = defineWithDefaults<ProjectVersionSourceSync>(
  MODEL_PROJECT_VERSION_SOURCE_SYNC,
  {
    // PK
    projectVersionId: { // 123
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    sourceSyncId: { // 456
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  },
  {
    tableName: TABLE_PROJECT_VERSION_SOURCE_SYNC
  }
)
