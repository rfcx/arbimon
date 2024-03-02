import { superProjectMembersRoute, superProjectsRoute } from '@rfcx-bio/common/api-bio/super/projects'

import { requireSuperUser } from '@/_hooks/require-super'
import { addProjectMemberHandler, deleteProjectMemberHandler, getProjectMembersHandler, patchProjectMemberHandler } from '@/projects/project-member-handler'
import { type RouteRegistration, DELETE, GET, PATCH, POST } from '../_services/api-helpers/types'
import { superGetProjectsHandler } from './super-projects-handler'

export const routesSuper: RouteRegistration[] = [
  {
    method: GET,
    url: superProjectsRoute,
    handler: superGetProjectsHandler
  },
  {
    method: GET,
    url: superProjectMembersRoute,
    handler: getProjectMembersHandler
  },
  {
    method: POST,
    url: superProjectMembersRoute,
    handler: addProjectMemberHandler
  },
  {
    method: PATCH,
    url: superProjectMembersRoute,
    handler: patchProjectMemberHandler
  },
  {
    method: DELETE,
    url: superProjectMembersRoute,
    handler: deleteProjectMemberHandler
  }
].map(r => ({ ...r, preHandler: [requireSuperUser] }))
