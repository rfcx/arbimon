import { ProjectsResponse } from '@rfcx-bio/common/api-bio/common/projects'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_LOCATION_PROJECT } from '@rfcx-bio/common/dao/types'

import { ApiServerError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'

export const projectsAllHandler: Handler<ProjectsResponse> = async (req) => {
  const models = ModelRepository.getInstance(getSequelize())

  const projects = await models.LocationProject
    .findAll({
      order: ['name'],
      attributes: ATTRIBUTES_LOCATION_PROJECT.light
    })
    .catch(err => {
      req.log.error(err)
      throw ApiServerError()
    })

  return projects
}
