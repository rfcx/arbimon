export interface CoreUser {
  firstname: string
  lastname: string
  email: string
  picture: string | null
  role: 'Admin' | 'Member' | 'Guest'
  permissions: Array<'C' | 'R' | 'U' | 'D'>
}
