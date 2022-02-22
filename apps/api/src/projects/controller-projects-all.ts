import { ProjectsResponse } from '@rfcx-bio/common/api-bio/common/projects'
import { ModelRepositoryFactory } from '@rfcx-bio/common/dao/model-repository'
import { PROJECT_MODEL_ATTRIBUTES } from '@rfcx-bio/common/dao/models/location-project-model'

import { ApiServerError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'

export const projectsAllHandler: Handler<ProjectsResponse> = async () => {
  const models = ModelRepositoryFactory.getInstance(getSequelize())

  const projects = await models.LocationProject
    .findAll({
      where: { isPublished: true },
      order: ['name'],
      attributes: PROJECT_MODEL_ATTRIBUTES.light
    })
    .catch(err => {
      console.error(err)
      throw ApiServerError()
    })

  return projects
}
