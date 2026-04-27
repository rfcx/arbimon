import { type LocationProjectQuery } from '@rfcx-bio/common/api-bio/project/projects'
import { type SuperProjectSummary, type SuperProjectTierUpdateBody, type SuperUserSummary, type SuperUserTierUpdateBody } from '@rfcx-bio/common/api-bio/super/projects'

import { type Handler } from '../_services/api-helpers/types'
import { getProjects, getUserProjects, getUsers, updateProjectTier, updateUserTier } from './super-projects-bll'

export const superGetProjectsHandler: Handler<SuperProjectSummary[], unknown, LocationProjectQuery> = async (req) => {
  return await getProjects(req.query.keyword, req.query.limit, req.query.offset)
}

export const superGetUsersHandler: Handler<SuperUserSummary[], unknown, LocationProjectQuery> = async (req) => {
  return await getUsers(req.query.keyword, req.query.limit, req.query.offset)
}

export const superGetUserProjectsHandler: Handler<SuperProjectSummary[], { userId: number }> = async (req) => {
  return await getUserProjects(Number(req.params.userId))
}

export const superUpdateProjectTierHandler: Handler<string, { projectId: number }, unknown, SuperProjectTierUpdateBody> = async (req, reply) => {
  await updateProjectTier(Number(req.params.projectId), req.body)
  void reply.code(204)
  return ''
}

export const superUpdateUserTierHandler: Handler<string, { userId: number }, unknown, SuperUserTierUpdateBody> = async (req, reply) => {
  await updateUserTier(Number(req.params.userId), req.body)
  void reply.code(204)
  return ''
}
