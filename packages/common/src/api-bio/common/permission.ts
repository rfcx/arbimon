export type ProjectPermission = 'C' | 'R' | 'U' | 'D'

export interface CoreProjectPermissions {
  id: string
  name: string
  permission: ProjectPermission[]
}
