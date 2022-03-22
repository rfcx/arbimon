import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import dayjs from '@/../../../packages/utils/node_modules/dayjs'
import { Middleware } from '../api-helpers/types'
import { getSequelize } from '../db'
import { getUserCoreProjectIds, isProjectMember, isValidToken } from '../security/project-access'

interface ProjectRouteParams {
  projectId: string
}

interface Auth0UserInfo {
  auth0_user_id: string
}

export const IS_PROJECT_MEMBER = 'isProjectMember'
export const ACCESSIBLE_CORE_PROJECT_IDS = 'cacheUserProjectCoreIds'

export const EXPIRED_DURATION_HOURS = 1

export const verifyProjectUserPermission: Middleware<ProjectRouteParams> = async (req, res): Promise<void> => {
  const token = req.headers.authorization
  const bioProjectId = Number(req.params.projectId)

  if (token === undefined || bioProjectId === undefined) return

  const coreProjectId = await LocationProjectModel(getSequelize())
    .findByPk(bioProjectId, { attributes: ['idCore'] })
    .then(proj => proj?.idCore)

  if (coreProjectId === undefined) return

  const isMember = await isProjectMember(req.log, coreProjectId, token)
  if (isMember) { req.requestContext.set(IS_PROJECT_MEMBER, isMember) }
}

export const verifyUserAccessibleProjects: Middleware = async (req, res): Promise<void> => {
  const token = req.headers.authorization

  if (token === undefined || !isValidToken(token)) return

  const decodedUserInfo = await req.jwtDecode<Auth0UserInfo>()
  const userId = decodedUserInfo.auth0_user_id

  const models = ModelRepository.getInstance(getSequelize())

  // If user contain in cache and not expired
  const matchedUserCache = await models.CacheUserProject
    .findByPk(userId, { raw: true }) ?? undefined
  if (matchedUserCache && (dayjs(matchedUserCache.expiredAt).isAfter(dayjs()))) {
    req.requestContext.set(ACCESSIBLE_CORE_PROJECT_IDS, matchedUserCache.projectCoreIds)
    return
  }

  // If user not contain in cache or expired
  const projectCoreIds = await getUserCoreProjectIds(req.log, token)
  const expiredAt = dayjs().add(EXPIRED_DURATION_HOURS, 'hours').toDate()
  await models.CacheUserProject.upsert({ userId, projectCoreIds, expiredAt })
  req.requestContext.set(ACCESSIBLE_CORE_PROJECT_IDS, projectCoreIds)
}
