import { FastifyRequest } from 'fastify'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { EXPIRED_DURATION_HOURS } from '~/cache/user-project-cache'
import { getProjectIds } from '~/api-core/api-core'
import { isValidToken } from '~/api-helpers/is-valid-token'
import { Middleware } from '~/api-helpers/types'
import { Auth0UserInfo } from '~/auth0'
import { dayjs } from '~/dayjs-initialized'
import { getSequelize } from '~/db'

const MEMBER_PROJECT_CORE_IDS = 'MEMBER_PROJECT_CORE_IDS'

export const getMemberProjectCoreIds = (req: FastifyRequest): string[] =>
  req.requestContext.get(MEMBER_PROJECT_CORE_IDS)

export const loadMemberProjectCoreIds: Middleware = async (req, res): Promise<void> => {
  const token = req.headers.authorization

  // No token => no projects
  if (token === undefined || !isValidToken(token)) {
    req.requestContext.set(MEMBER_PROJECT_CORE_IDS, [])
    return
  }

  // Get userId
  const decodedUserInfo = await req.jwtDecode<Auth0UserInfo>()
  const userId = decodedUserInfo.auth0_user_id

  // Get cache
  // TODO: Extract cache DAO
  const models = ModelRepository.getInstance(getSequelize())
  const cache = await models.CacheUserProject
    .findByPk(userId, { raw: true }) ?? undefined

  // Unexpired cache => return it
  if (cache && (dayjs(cache.expiredAt).isAfter(dayjs()))) {
    req.requestContext.set(MEMBER_PROJECT_CORE_IDS, cache.projectCoreIds)
    return
  }

  // Get project IDs from Core API
  const projectCoreIds = await getProjectIds(token)
    .catch(err => {
      req.log.error(err)
      return []
    })

  // Store in cache
  const expiredAt = dayjs().add(EXPIRED_DURATION_HOURS, 'hours').toDate()
  await models.CacheUserProject.upsert({ userId, projectCoreIds, expiredAt })

  // Return
  req.requestContext.set(MEMBER_PROJECT_CORE_IDS, projectCoreIds)
}
