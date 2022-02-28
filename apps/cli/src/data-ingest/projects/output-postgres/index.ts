import pkg from 'sequelize'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'
import { Project } from '@rfcx-bio/common/dao/types'

import { requireEnv } from '~/env'
import { getSequelize } from '../../../db/connections'
import { rawEnvToProjectAndProfile } from '../../../db/seeders/_data/location-project-and-profile'

const { Op } = pkg

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const writeProjectsToPostgres = async (projects: Array<Omit<Project, 'id'>>): Promise<void> => {
  const model = LocationProjectModel(getSequelize())
  const mockProjectCoreIds = rawEnvToProjectAndProfile[BIO_ENVIRONMENT].map(mp => mp.idCore)

  const updatedProjects = projects.map(p => {
    return {
      ...p,
      isPublished: mockProjectCoreIds.includes(p.idCore) // force publishing projects in the mock project list
    }
  })

  // update items
  const updatedRows = await model.bulkCreate(updatedProjects, {
    updateOnDuplicate: [
      'name',
      'isPublished',
      'latitudeNorth',
      'latitudeSouth',
      'longitudeEast',
      'longitudeWest'
    ]
  })

  // delete non exist items
  const deletedRows = await model.destroy({
    where: {
      idCore: {
        [Op.ne]: null,
        [Op.notIn]: updatedProjects.map(p => p.idCore)
      }
    }
  })

  console.info(`- writeProjectsToPostgres: bulk upsert ${updatedRows.length} projects`)
  console.info(`- writeProjectsToPostgres: deleted ${deletedRows} projects`)
}
