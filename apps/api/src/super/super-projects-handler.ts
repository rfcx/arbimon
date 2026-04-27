import { type SuperPaginationResponse, type SuperProjectQuery, type SuperProjectSummary, type SuperProjectTierUpdateBody, type SuperUserQuery, type SuperUserSummary, type SuperUserTierUpdateBody } from '@rfcx-bio/common/api-bio/super/projects'

import { type Handler } from '../_services/api-helpers/types'
import { getProjects, getUserProjects, getUsers, updateProjectTier, updateUserTier } from './super-projects-bll'

export const superGetProjectsHandler: Handler<SuperPaginationResponse<SuperProjectSummary>, unknown, SuperProjectQuery> = async (req) => {
  return await getProjects(req.query.keyword, req.query.limit, req.query.offset, req.query.tier)
}

export const superGetUsersHandler: Handler<SuperPaginationResponse<SuperUserSummary>, unknown, SuperUserQuery> = async (req) => {
  return await getUsers(req.query.keyword, req.query.limit, req.query.offset, req.query.tier)
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
