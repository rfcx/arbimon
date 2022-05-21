import { AttributeConstants } from '../../type-helpers'

export interface Project {
  id: number
  idCore: string
  idArbimon: number
  slug: string
  name: string
}

export type ProjectLight = Pick<Project,
  'id'| 'slug'| 'name'
>

export const ATTRIBUTES_LOCATION_PROJECT: AttributeConstants<Project> = {
  light: ['id', 'slug', 'name']
}
