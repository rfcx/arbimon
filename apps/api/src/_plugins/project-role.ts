import { type FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

import { type ProjectRole, getRoleById } from '@rfcx-bio/common/roles'

import { getRoleIdByProjectAndUser } from '@/projects/dao/get-project-members-dao'
import { getProjectById } from '@/projects/dao/projects-dao'

const plugin: FastifyPluginCallback = (instance, _options, done) => {
  instance.decorateRequest('projectRole', 'none', ['userId'])

  instance.addHook('preHandler', async (request) => {
    const params = request.params as { projectId?: string }
    if (params.projectId === undefined) {
      return
    }

    const projectId = Number(params.projectId)
    // TODO: check projectId is not NaN

    // TODO: we would like a cache of projectId => isPublished
    const projectIsPublished = await getProjectById(projectId).then(p => p?.isPublished ?? false)
    const userId = request.userId

    // When there is no user (no token) and project is not published, no role
    // When there is no user and project is published, set as guest
    if (userId === undefined) {
      request.projectRole = projectIsPublished ? 'guest' : 'none'
      return
    }

    // TODO: we would like a cache of userId => roleId
    const roleId = await getRoleIdByProjectAndUser(projectId, userId)

    // When the user is not a project member and project is not published, no role
    // When the user is not a project member and project is published, set as guest
    if (roleId === undefined) {
      request.projectRole = projectIsPublished ? 'guest' : 'none'
    }

    // Else user is project member, set the role from the db
    request.projectRole = roleId !== undefined ? getRoleById(roleId) : 'none'
  })

  done()
}

export const projectRolePlugin = fp(plugin, {
  fastify: '3.x',
  name: 'project-role'
})

declare module 'fastify' {
  interface FastifyRequest {
    projectRole: ProjectRole
  }
}
