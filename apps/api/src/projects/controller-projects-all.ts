import { ProjectsResponse } from '@rfcx-bio/common/api-bio/common/projects'
import { PROJECT_MODEL_ATTRIBUTES, ProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'

export const projectsAllHandler: Handler<ProjectsResponse> = async () => {
  const projects = await ProjectModel(getSequelize()).findAll({
    attributes: PROJECT_MODEL_ATTRIBUTES.light
  })
  return projects
}
