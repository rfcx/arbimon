import { projectCapabilitiesRoute } from '@rfcx-bio/common/api-bio/project/project-capabilities'
import { projectCreateRoute } from '@rfcx-bio/common/api-bio/project/project-create'
import { projectDeleteRoute } from '@rfcx-bio/common/api-bio/project/project-delete'
import { projectEntitlementSummaryRoute } from '@rfcx-bio/common/api-bio/project/project-entitlement-summary'
import { projectFiltersRoute } from '@rfcx-bio/common/api-bio/project/project-filters'
import { projectProfileImageRoute } from '@rfcx-bio/common/api-bio/project/project-image'
import { projectMembersRoute } from '@rfcx-bio/common/api-bio/project/project-members'
import { updateProjectPublishStatusRoute } from '@rfcx-bio/common/api-bio/project/project-publish-status'
import { projectSitesRecordingCountRoute } from '@rfcx-bio/common/api-bio/project/project-recordings'
import { projectRoleRoute } from '@rfcx-bio/common/api-bio/project/project-role'
import { projectDataRoute } from '@rfcx-bio/common/api-bio/project/project-settings'
import { projectUploadLimitSummaryRoute } from '@rfcx-bio/common/api-bio/project/project-upload-limit-summary'
import { myProjectsRoute, projectBySlugRoute, projectsDeprecatedRoute, projectsGeoRoute } from '@rfcx-bio/common/api-bio/project/projects'

import { logBody } from '@/_hooks/log-body'
import { requireAuthorized } from '@/_hooks/require-authenticated'
import { requireProjectPermission } from '@/_hooks/require-permission'
import { requireProjectDeleteAllowed } from '@/_hooks/require-project-capability'
import { type RouteRegistration, DELETE, GET, PATCH, POST } from '../_services/api-helpers/types'
import { projectCapabilitiesHandler } from './project-capabilities-handler'
import { projectCreateHandler } from './project-create-handler'
import { projectDeleteHandler } from './project-delete-handler'
import { projectEntitlementSummaryHandler } from './project-entitlement-summary-handler'
import { projectFiltersHandler, projectRecordingCountBySiteHandler } from './project-filters-handler'
import { projectUpdateImageHandler } from './project-image-handler'
import { addProjectMemberHandler, deleteProjectMemberHandler, getProjectMembersHandler, getProjectRoleHandler, patchProjectMemberHandler } from './project-member-handler'
import { projectProfileHandler, projectProfileStakeholdersReadOnlyHandler, projectProfileUpdateHandler } from './project-profile-handler'
import { patchProjectPublishStatusHandler } from './project-publish-status-handler'
import { projectUploadLimitSummaryHandler } from './project-upload-limit-summary-handler'
import { getProjectBySlugHandler, myProjectsHandler, projectsAllHandler, projectsGeoHandler } from './projects-handler'

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
    url: projectBySlugRoute,
    handler: getProjectBySlugHandler
  },
  {
    method: GET,
    url: projectEntitlementSummaryRoute,
    handler: projectEntitlementSummaryHandler
  },
  {
    method: GET,
    url: projectUploadLimitSummaryRoute,
    preHandler: [requireAuthorized],
    handler: projectUploadLimitSummaryHandler
  },
  {
    method: GET,
    url: projectCapabilitiesRoute,
    preHandler: [requireAuthorized],
    handler: projectCapabilitiesHandler
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
    preHandler: [requireProjectPermission('update-profile'), logBody],
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
    // Project deletion (2026-07-12, operator D3): super users always; project
    // owners may self-serve delete SMALL projects (<= PROJECT_DELETE_MAX_RECORDINGS,
    // default 60 recordings). Authz enforced inside the handler
    // (requireProjectDeleteAllowed) because it needs the live recording count.
    preHandler: [requireProjectDeleteAllowed],
    handler: projectDeleteHandler
  }
]
