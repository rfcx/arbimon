export type ProjectRole = 'none' | 'external' | 'viewer' | 'entry' | 'user' | 'expert' | 'admin' | 'owner'
export type ProjectPermission = 'read-profile' | 'read-insights' | 'read-insights-sensitive' | 'read-users' | 'update-profile' | 'update-project-status' | 'update-users' | 'delete-project' | 'read-cnn'

const roles: Record<number, ProjectRole> = {
  1: 'admin',
  2: 'user',
  3: 'viewer',
  4: 'owner',
  5: 'entry',
  6: 'expert'
}

export const orderedRoles: ProjectRole[] = ['external', 'viewer', 'entry', 'user', 'expert', 'admin', 'owner']

export const rolesGreaterOrEqualTo = (role: ProjectRole): ProjectRole[] =>
  orderedRoles.filter((r, i) => i >= orderedRoles.indexOf(role))

const permissions: Record<ProjectPermission, ProjectRole[]> = {
  'read-profile': rolesGreaterOrEqualTo('external'),
  'read-insights': rolesGreaterOrEqualTo('external'),
  'read-insights-sensitive': rolesGreaterOrEqualTo('viewer'),
  'read-users': rolesGreaterOrEqualTo('viewer'),
  'update-profile': rolesGreaterOrEqualTo('admin'),
  'update-project-status': rolesGreaterOrEqualTo('admin'),
  'update-users': rolesGreaterOrEqualTo('admin'),
  'read-cnn': rolesGreaterOrEqualTo('user'),
  'delete-project': ['owner']
}

export const getRoleById = (roleId: number): ProjectRole => roles[roleId] ?? 'none'
export const getIdByRole = (role: ProjectRole): number => Number(Object.keys(roles).find(id => roles[Number(id)] === role))

export const hasPermission = (role: ProjectRole, permission: ProjectPermission): boolean =>
  permissions[permission].includes(role)

export const RANKING_NONE = -1 // Not visible to non-project members
export const RANKING_PRIMARY = 0 // Primary contact
