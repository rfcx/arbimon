import { type ProjectMemberAddRemoveRequest, type ProjectMembersParams, type ProjectMembersResponse, type ProjectMemberUpdateRequest } from '@rfcx-bio/common/api-bio/project/project-members'
import { type ProjectRole } from '@rfcx-bio/common/roles'

import { type Handler } from '~/api-helpers/types'
import { projectIdPathParam } from '~/validation'
import { get, getUserRoleForProject } from './dao/project-member-dao'
import { addProjectMember, removeProjectMember, updateProjectMember } from './project-member-bll'

export const getProjectMembersHandler: Handler<ProjectMembersResponse, ProjectMembersParams> = async (request) => {
  const projectId = projectIdPathParam(request.params)

  const projectUsers = await get(projectId)
  return projectUsers
}

export const getProjectRoleHandler: Handler<ProjectRole, ProjectMembersParams> = async (request) => {
  const projectId = projectIdPathParam(request.params)
  const userId = request.userId

  return await getUserRoleForProject(userId, projectId)
}

export const addProjectMemberHandler: Handler<string, ProjectMembersParams, unknown, ProjectMemberAddRemoveRequest> = async (request, reply) => {
  const projectId = projectIdPathParam(request.params)

  await addProjectMember(projectId, request.body.email, request.body.role)
  void reply.status(204)
  return ''
}

export const deleteProjectMemberHandler: Handler<string, ProjectMembersParams, unknown, ProjectMemberAddRemoveRequest> = async (request, reply) => {
  const projectId = projectIdPathParam(request.params)

  await removeProjectMember(projectId, request.body.email)
  void reply.status(204)
  return ''
}

export const patchProjectMemberHandler: Handler<string, ProjectMembersParams, unknown, ProjectMemberUpdateRequest> = async (request, reply) => {
  const projectId = projectIdPathParam(request.params)

  await updateProjectMember(projectId, request.body.email, request.body.role)
  void reply.status(204)
  return ''
}
