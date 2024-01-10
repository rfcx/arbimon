import { type ProjectDeleteParams } from '@rfcx-bio/common/api-bio/project/project-delete'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { deleteProject } from './project-delete-bll'

export const projectDeleteHandler: Handler<string, ProjectDeleteParams> = async (request, reply) => {
  // Inputs & validation
  const { projectId } = request.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  await deleteProject(projectIdInteger, request.headers.authorization ?? '')

  void reply.code(204)
  return ''
}
