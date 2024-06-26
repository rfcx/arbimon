import { type ProjectFiltersParams, type ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/project/project-filters'
import { type ProjectRecordingCountParams, type SitesRecCountAndDates } from '@rfcx-bio/common/api-bio/project/project-recordings'

import { getProjectFilters, getProjectRecordingCountBySite } from '@/projects/project-filters-bll'
import { ApiServerError, BioInvalidPathParamError } from '~/errors'
import { type Handler } from '../_services/api-helpers/types'
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

export const projectRecordingCountBySiteHandler: Handler<SitesRecCountAndDates[], ProjectRecordingCountParams> = async (req) => {
  try {
    // Inputs & validation
    const { projectId } = req.params
    assertPathParamsExist({ projectId })

    const projectIdInteger = parseInt(projectId)
    if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

    // Query & Response
    return await getProjectRecordingCountBySite(projectIdInteger)
  } catch (err) {
    // Error handling
    req.log.error(err)
    throw ApiServerError()
  }
}
