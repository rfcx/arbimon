import { type FastifyRequest } from 'fastify'

import { type ProjectRouteParamsSerialized } from '@rfcx-bio/common/api-bio/_helpers'
import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { getIsProjectMemberFromApi } from '~/api-core/api-core'
import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Middleware } from '~/api-helpers/types'
import { extractUserId } from '~/auth0/extract-user'
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

  const auth0UserId = await extractUserId(req)

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
