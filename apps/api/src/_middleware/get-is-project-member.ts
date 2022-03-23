import { FastifyRequest } from 'fastify'

import { ProjectSpecificRouteParams } from '@rfcx-bio/common/api-bio/common/project-specific-route'
import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { getIsProjectMember as getIsProjectMemberFromApi } from '~/api-core/api-core'
import { isValidToken } from '~/api-helpers/is-valid-token'
import { Middleware } from '~/api-helpers/types'
import { getSequelize } from '~/db'
import { BioPublicError, ERROR_STATUS_CODE } from '~/errors'

const IS_PROJECT_MEMBER = 'IS_PROJECT_MEMBER'

export const getIsProjectMember = (req: FastifyRequest): boolean =>
  req.requestContext.get(IS_PROJECT_MEMBER) === true

export const loadIsProjectMember: Middleware<ProjectSpecificRouteParams> = async (req, res): Promise<void> => {
  const token = req.headers.authorization
  const projectIdBio = Number(req.params.projectId)

  // No token => not project member
  if (token === undefined || !isValidToken(token) || projectIdBio === undefined) {
    req.requestContext.set(IS_PROJECT_MEMBER, false)
    return
  }

  // Get idCore
  const projectIdCore = await LocationProjectModel(getSequelize())
    .findByPk(projectIdBio, { attributes: ['idCore'] })
    .then(proj => proj?.idCore)

  // No project => not project member
  if (projectIdCore === undefined) {
    req.requestContext.set(IS_PROJECT_MEMBER, false)
    return
  }

  // Call Core API
  const isProjectMember = await getIsProjectMemberFromApi(projectIdCore, token)
    .then(() => true)
    .catch(err => {
      // Forbidden is expected (it means the user is not a project member)
      if (err instanceof BioPublicError && err.statusCode === ERROR_STATUS_CODE.forbidden) return false

      // Log unexpected errors
      req.log.error(err)
      return false
    })

  req.requestContext.set(IS_PROJECT_MEMBER, isProjectMember)
}
