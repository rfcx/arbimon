import { type FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

import { type ProjectRole } from '@rfcx-bio/common/roles'

import { isSuperUser } from '@/_services/auth0/is-super-user'
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

    // Super-user bypass: org-level support/scientist accounts (allow-list in
    // SUPER_USER_EMAILS) are escalated to 'admin' on any project they aren't an
    // explicit member of, for every project-scoped permission check (members,
    // insights, profile, etc.) -- not only the project-by-slug lookup.
    //
    // This mirrors `getProjectBySlugForUser` in projects-bll.ts, which already
    // escalates super users to 'admin'. Without the same bypass here, a super
    // user could load a project's overview (escalated) but still get a 403 from
    // `requireProjectPermission` on /members, /filters, etc. (role resolved to
    // 'none'). We escalate to 'admin' rather than 'owner' so owner-only
    // operations (e.g. project deletion) still require a real owner membership.
    request.projectRole = role === 'none' && isSuperUser(request) ? 'admin' : role
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
