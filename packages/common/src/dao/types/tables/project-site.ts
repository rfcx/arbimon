import { AttributeConstants } from '../../type-helpers'

export interface ProjectSite {
  id: number
  idCore: string
  idArbimon: number
  projectId: number
  projectVersionFirstAppearsId: number
  name: string
  latitude: number
  longitude: number
  altitude: number
}

export const ATTRIBUTES_PROJECT_SITE: AttributeConstants<ProjectSite> = {
  light: ['id', 'name', 'latitude', 'longitude', 'altitude']
}
