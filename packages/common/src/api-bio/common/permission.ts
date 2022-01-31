export interface ProjectCreator {
  firstname: string
  lastname: string
  email: string
  picture: string
}

export interface CoreProject {
  id: string
  name: string
  is_public: boolean
  created_by_id: number
  organization_id: number
  external_id: number
  is_partner: boolean
  created_at: string
  updated_at: string
  min_latitude: number
  min_longitude: number
  max_latitude: number
  max_longitude: number
  preferred_platform: string
  created_by: ProjectCreator
  organization: string
}
