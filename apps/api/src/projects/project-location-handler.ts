import { type ProjectLocationParams, type ProjectLocationResponse } from '@rfcx-bio/common/api-bio/project/project-location'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectLocation } from './project-location-bll'

export const projectLocationHandler: Handler<ProjectLocationResponse, ProjectLocationParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectLocation = await getProjectLocation(projectIdInteger)

  return {
    ...projectLocation
  }
}
