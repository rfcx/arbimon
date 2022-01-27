import { CoreProjectWithPermissionLite } from '@rfcx-bio/common/api-bio/common/permission'

declare module 'fastify-request-context' {
  interface RequestContextData {
    projectPermission: CoreProjectWithPermissionLite | undefined
  }
}
