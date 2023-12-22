export type ProjectRole = 'none' | 'guest' | 'entry' | 'user' | 'expert' | 'admin' | 'owner'
export type ProjectPermission = 'read-profile' | 'update-profile' | 'read-insights' | 'read-insights-sensitive'

const roles: Record<number, ProjectRole> = {
  1: 'admin',
  2: 'user',
  3: 'guest',
  4: 'owner',
  5: 'entry',
  6: 'expert'
}

const permissions: Record<ProjectPermission, ProjectRole[]> = {
  'read-profile': ['guest', 'entry', 'user', 'expert', 'admin', 'owner'],
  'read-insights': ['guest', 'entry', 'user', 'expert', 'admin', 'owner'],
  'read-insights-sensitive': ['user', 'expert', 'admin', 'owner'],
  'update-profile': ['admin', 'owner']
}

export const getRoleById = (roleId: number): ProjectRole => roles[roleId] ?? 'none'

export const hasPermission = (role: ProjectRole, permission: ProjectPermission): boolean =>
  permissions[permission].includes(role)
