import { type FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

import { type ProjectRole } from '@rfcx-bio/common/roles'

import { getUserRoleForProject } from '@/projects/dao/project-member-dao'

const plugin: FastifyPluginCallback = (instance, _options, done) => {
  instance.decorateRequest('projectRole', 'none', ['userId'])

  instance.addHook('preHandler', async (request) => {
    const params = request.params as { projectId?: string }
    if (params.projectId === undefined) {
      return
    }

    const projectId = Number(params.projectId)
    // TODO: check projectId is not NaN

    const role = await getUserRoleForProject(request.userId, projectId)
    // TODO: cache this result
    request.projectRole = role
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
