export type ProjectRole = 'none' | 'guest' | 'entry' | 'user' | 'expert' | 'admin' | 'owner'
export type ProjectPermission = 'read-profile' | 'read-insights' | 'read-insights-sensitive' | 'read-users' | 'update-profile' | 'update-publish-status' | 'delete-project'

const roles: Record<number, ProjectRole> = {
  1: 'admin',
  2: 'user',
  3: 'guest',
  4: 'owner',
  5: 'entry',
  6: 'expert'
}

const orderedRoles: ProjectRole[] = ['guest', 'entry', 'user', 'expert', 'admin', 'owner']

export const rolesGreaterOrEqualTo = (role: ProjectRole): ProjectRole[] =>
  orderedRoles.filter((r, i) => i >= orderedRoles.indexOf(role))

const permissions: Record<ProjectPermission, ProjectRole[]> = {
  'read-profile': rolesGreaterOrEqualTo('guest'),
  'read-insights': rolesGreaterOrEqualTo('guest'),
  'read-insights-sensitive': rolesGreaterOrEqualTo('user'),
  'read-users': rolesGreaterOrEqualTo('user'),
  'update-profile': rolesGreaterOrEqualTo('admin'),
  'update-publish-status': rolesGreaterOrEqualTo('admin'),
  'delete-project': ['owner']
}

export const getRoleById = (roleId: number): ProjectRole => roles[roleId] ?? 'none'
export const getIdByRole = (role: ProjectRole): number => Number(Object.keys(roles).find(id => roles[Number(id)] === role))

export const hasPermission = (role: ProjectRole, permission: ProjectPermission): boolean =>
  permissions[permission].includes(role)

export const RANKING_NONE = -1 // Not visible to non-project members
export const RANKING_PRIMARY = 0 // Primary contact
