import { FastifyRequest } from 'fastify'

import { getMemberProjectCoreIdsFromApi } from '~/api-core/api-core'
import { isValidToken } from '~/api-helpers/is-valid-token'
import { Middleware } from '~/api-helpers/types'
import { Auth0UserInfo } from '~/auth0'
import { getMemberProjectCoreIdsFromCache, updateMemberProjectCoreIds } from '~/cache/user-project-cache'

const MEMBER_PROJECT_CORE_IDS = 'MEMBER_PROJECT_CORE_IDS'

export const getMemberProjectCoreIds = (req: FastifyRequest): string[] =>
  req.requestContext.get(MEMBER_PROJECT_CORE_IDS) ?? []

export const setMemberProjectCoreIds: Middleware = async (req, res): Promise<void> => {
  const token = req.headers.authorization

  // No token => no projects
  if (token === undefined || !isValidToken(token)) {
    req.requestContext.set(MEMBER_PROJECT_CORE_IDS, [])
    return
  }

  // Get userId
  const auth0UserInfo = await req.jwtDecode<Auth0UserInfo>()
  const auth0UserId = auth0UserInfo.auth0_user_id

  // If in cache => return
  const projectCoreIdsFromCache = await getMemberProjectCoreIdsFromCache(auth0UserId)
  if (projectCoreIdsFromCache) {
    req.requestContext.set(MEMBER_PROJECT_CORE_IDS, projectCoreIdsFromCache)
    return
  }

  // Get from Core API (& update cache)
  const projectCoreIds = await getMemberProjectCoreIdsFromApi(token)
    .catch(err => {
      req.log.error(err)
      return []
    })

  await updateMemberProjectCoreIds(auth0UserId, projectCoreIds)

  // Set & return
  req.requestContext.set(MEMBER_PROJECT_CORE_IDS, projectCoreIds)
}
