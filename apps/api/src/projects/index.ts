import { projectCreateRoute } from '@rfcx-bio/common/api-bio/project/project-create'
import { projectDeleteRoute } from '@rfcx-bio/common/api-bio/project/project-delete'
import { projectFiltersRoute } from '@rfcx-bio/common/api-bio/project/project-filters'
import { projectProfileImageRoute } from '@rfcx-bio/common/api-bio/project/project-image'
import { updateProjectPublishStatusRoute } from '@rfcx-bio/common/api-bio/project/project-publish-status'
import { projectSitesRecordingCountRoute } from '@rfcx-bio/common/api-bio/project/project-recordings'
import { projectDataRoute } from '@rfcx-bio/common/api-bio/project/project-settings'
import { myProjectsRoute, projectsRoute } from '@rfcx-bio/common/api-bio/project/projects'

import { requireAuthorized } from '@/_hooks/require-authenticated'
import { requireProjectPermission } from '@/_hooks/require-permission'
import { type RouteRegistration, DELETE, GET, PATCH, POST } from '../_services/api-helpers/types'
import { projectCreateHandler } from './project-create-handler'
import { projectDeleteHandler } from './project-delete-handler'
import { projectFiltersHandler, projectRecordingCountBySiteHandler } from './project-filters-handler'
import { projectUpdateImageHandler } from './project-image-handler'
import { deleteProjectMemberHandler, getProjectMembersHandler, getProjectPermissionHandler } from './project-member'
import { projectProfileHandler, projectProfileStakeholdersReadOnlyHandler, projectProfileUpdateHandler } from './project-profile-handler'
import { patchProjectPublishStatusHandler } from './project-publish-status-handler'
import { myProjectsHandler, projectsAllHandler } from './projects-handler'

export const routesProject: RouteRegistration[] = [
  {
    method: GET,
    url: projectsRoute,
    handler: projectsAllHandler
  },
  {
    method: GET,
    url: myProjectsRoute,
    preHandler: [requireAuthorized],
    handler: myProjectsHandler
  },
  {
    method: GET,
    url: projectFiltersRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: projectFiltersHandler
  },
  {
    method: GET,
    url: projectSitesRecordingCountRoute,
    preHandler: [requireProjectPermission('read-insights')],
    handler: projectRecordingCountBySiteHandler
  },
  {
    method: POST,
    url: projectCreateRoute,
    preHandler: [requireAuthorized],
    handler: projectCreateHandler
  },
  {
    method: PATCH,
    url: updateProjectPublishStatusRoute,
    preHandler: [requireProjectPermission('update-project-status')],
    handler: patchProjectPublishStatusHandler
  },
  {
    method: GET,
    url: projectDataRoute + '/users',
    preHandler: [requireProjectPermission('read-users')],
    handler: getProjectMembersHandler
  },
  {
    method: GET,
    url: projectDataRoute + '/role',
    handler: getProjectPermissionHandler
  },
  {
    method: GET,
    url: projectDataRoute + '/profile',
    handler: projectProfileHandler
  },
  {
    method: GET,
    url: projectDataRoute + '/profile/stakeholders',
    preHandler: [requireProjectPermission('read-profile')],
    handler: projectProfileStakeholdersReadOnlyHandler
  },
  {
    method: PATCH,
    url: projectDataRoute + '/profile',
    preHandler: [requireProjectPermission('update-profile')],
    handler: projectProfileUpdateHandler
  },
  {
    method: PATCH,
    url: projectProfileImageRoute,
    preHandler: [requireProjectPermission('update-profile')],
    handler: projectUpdateImageHandler
  },
  {
    method: DELETE,
    url: projectDataRoute + '/users-delete',
    preHandler: [requireProjectPermission('update-profile')],
    handler: deleteProjectMemberHandler
  },
  {
    method: DELETE,
    url: projectDeleteRoute,
    preHandler: [requireProjectPermission('delete-project')],
    handler: projectDeleteHandler
  }
]
