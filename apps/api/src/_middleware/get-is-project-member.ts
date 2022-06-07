import { FastifyRequest } from 'fastify'

import { ProjectRouteParamsSerialized } from '@rfcx-bio/common/api-bio/_helpers'
import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { getIsProjectMemberFromApi } from '~/api-core/api-core'
import { isValidToken } from '~/api-helpers/is-valid-token'
import { Middleware } from '~/api-helpers/types'
import { Auth0UserInfo } from '~/auth0'
import { getMemberProjectCoreIdsFromCache } from '~/cache/user-project-cache'
import { getSequelize } from '~/db'
import { BioPublicError, ERROR_STATUS_CODE } from '~/errors'

const IS_PROJECT_MEMBER = 'IS_PROJECT_MEMBER'

export const getIsProjectMember = (req: FastifyRequest): boolean =>
  req.requestContext.get(IS_PROJECT_MEMBER) ?? false

export const setIsProjectMember: Middleware<ProjectRouteParamsSerialized> = async (req, res): Promise<void> => {
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

  // Get userId
  const auth0UserInfo = await req.jwtDecode<Auth0UserInfo>()
  const auth0UserId = auth0UserInfo.auth0_user_id

  // If in cache => return
  const projectCoreIdsFromCache = await getMemberProjectCoreIdsFromCache(auth0UserId)
  if (projectCoreIdsFromCache) {
    req.requestContext.set(IS_PROJECT_MEMBER, projectCoreIdsFromCache.includes(projectIdCore))
    return
  }

  // Get from Core API (cannot update cache because it's currently not per-project)
  const isProjectMember = await getIsProjectMemberFromApi(projectIdCore, token)
    .then(() => true)
    .catch(err => {
      // Forbidden is expected (it means the user is not a project member)
      if (err instanceof BioPublicError && err.statusCode === ERROR_STATUS_CODE.forbidden) return false

      // Log unexpected errors
      req.log.error(err)
      return false
    })

  // Set & return
  req.requestContext.set(IS_PROJECT_MEMBER, isProjectMember)
}
