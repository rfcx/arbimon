import { projectCreateRoute } from '@rfcx-bio/common/api-bio/project/project-create'
import { projectDeleteRoute } from '@rfcx-bio/common/api-bio/project/project-delete'
import { projectFiltersRoute } from '@rfcx-bio/common/api-bio/project/project-filters'
import { projectProfileImageRoute } from '@rfcx-bio/common/api-bio/project/project-image'
import { projectMembersRoute } from '@rfcx-bio/common/api-bio/project/project-members'
import { updateProjectPublishStatusRoute } from '@rfcx-bio/common/api-bio/project/project-publish-status'
import { projectSitesRecordingCountRoute } from '@rfcx-bio/common/api-bio/project/project-recordings'
import { projectRoleRoute } from '@rfcx-bio/common/api-bio/project/project-role'
import { projectDataRoute } from '@rfcx-bio/common/api-bio/project/project-settings'
import { myProjectsRoute, projectsDeprecatedRoute, projectsGeoRoute } from '@rfcx-bio/common/api-bio/project/projects'

import { requireAuthorized } from '@/_hooks/require-authenticated'
import { requireProjectPermission } from '@/_hooks/require-permission'
import { type RouteRegistration, DELETE, GET, PATCH, POST } from '../_services/api-helpers/types'
import { projectCreateHandler } from './project-create-handler'
import { projectDeleteHandler } from './project-delete-handler'
import { projectFiltersHandler, projectRecordingCountBySiteHandler } from './project-filters-handler'
import { projectUpdateImageHandler } from './project-image-handler'
import { addProjectMemberHandler, deleteProjectMemberHandler, getProjectMembersHandler, getProjectRoleHandler, patchProjectMemberHandler } from './project-member-handler'
import { projectProfileHandler, projectProfileStakeholdersReadOnlyHandler, projectProfileUpdateHandler } from './project-profile-handler'
import { patchProjectPublishStatusHandler } from './project-publish-status-handler'
import { myProjectsHandler, projectsAllHandler, projectsGeoHandler } from './projects-handler'

export const routesProject: RouteRegistration[] = [
  {
    method: GET,
    url: projectsDeprecatedRoute,
    handler: projectsAllHandler
  },
  {
    method: GET,
    url: projectsGeoRoute,
    handler: projectsGeoHandler
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
    url: projectMembersRoute,
    preHandler: [requireProjectPermission('read-users')],
    handler: getProjectMembersHandler
  },
  {
    method: POST,
    url: projectMembersRoute,
    preHandler: [requireProjectPermission('update-users')],
    handler: addProjectMemberHandler
  },
  {
    method: PATCH,
    url: projectMembersRoute,
    preHandler: [requireProjectPermission('update-users')],
    handler: patchProjectMemberHandler
  },
  {
    method: DELETE,
    url: projectMembersRoute,
    preHandler: [requireProjectPermission('update-users')],
    handler: deleteProjectMemberHandler
  },
  {
    method: GET,
    url: projectRoleRoute,
    preHandler: [requireAuthorized],
    handler: getProjectRoleHandler
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
    url: projectDeleteRoute,
    preHandler: [requireProjectPermission('delete-project')],
    handler: projectDeleteHandler
  }
]
