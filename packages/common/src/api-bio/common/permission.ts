export type ProjectPermission = 'C' | 'R' | 'U' | 'D'

export interface CoreProjectWithPermissionLite {
  id: string
  name: string
  permission: ProjectPermission[]
}
