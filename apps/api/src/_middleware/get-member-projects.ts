import { type FastifyRequest } from 'fastify'

import { getMemberProjectCoreIdsFromApi } from '~/api-core/api-core'
import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Middleware } from '~/api-helpers/types'
import { extractUserId } from '~/auth0/extract-user'
import { getMemberProjectCoreIdsFromCache, updateMemberProjectCoreIds } from '~/cache/user-project-cache'

const MEMBER_PROJECT_CORE_IDS = 'MEMBER_PROJECT_CORE_IDS'

/**
 * @deprecated Use LocationProjectUserRole
 */
export const getMemberProjectCoreIds = (req: FastifyRequest): string[] =>
  req.requestContext.get(MEMBER_PROJECT_CORE_IDS) ?? []

/**
 * @deprecated Use LocationProjectUserRole
 */
export const setMemberProjectCoreIds: Middleware = async (req, res): Promise<void> => {
  const token = req.headers.authorization

  // No token => no projects
  if (token === undefined || !isValidToken(token)) {
    req.requestContext.set(MEMBER_PROJECT_CORE_IDS, [])
    return
  }

  const auth0UserId = await extractUserId(req)

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
