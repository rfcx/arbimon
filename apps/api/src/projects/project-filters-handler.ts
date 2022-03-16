import { ProjectFiltersParams, ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/common/project-filters'

import { getProjectFilters } from '@/projects/project-filters-bll'
import { ApiServerError, BioInvalidPathParamError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { assertPathParamsExist } from '../_services/validation'

export const projectFiltersHandler: Handler<ProjectFiltersResponse, ProjectFiltersParams> = async (req) => {
  try {
    // Inputs & validation
    const { projectId } = req.params
    assertPathParamsExist({ projectId })

    const projectIdInteger = Number(projectId)
    if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

    // Response
    return await getProjectFilters(projectIdInteger)
  } catch (err) {
    // Error handling
    req.log.error(err)
    throw ApiServerError()
  }
}
