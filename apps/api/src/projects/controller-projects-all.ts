import { ProjectsResponse } from '@rfcx-bio/common/api-bio/common/projects'
import { LocationProjectModel, PROJECT_MODEL_ATTRIBUTES } from '@rfcx-bio/common/dao/models/location-project-model'

import { Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'

export const projectsAllHandler: Handler<ProjectsResponse> = async () => {
  const projects = await LocationProjectModel(getSequelize()).findAll({
    attributes: PROJECT_MODEL_ATTRIBUTES.light
  })
  return projects
}
