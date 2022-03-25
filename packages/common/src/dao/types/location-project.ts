// TODO: Rename this to LocationProject & update references
export interface Project {
  id: number
  idCore: string
  idArbimon: number
  slug: string
  slugArbimon: string
  name: string
  latitudeNorth: number
  latitudeSouth: number
  longitudeEast: number
  longitudeWest: number
}

export type LocationProjectLight = Pick<Project,
  'id'| 'slug'| 'name'| 'latitudeNorth'| 'latitudeSouth'| 'longitudeEast'| 'longitudeWest'
>

export const ATTRIBUTES_LOCATION_PROJECT: Record<string, Array<keyof Project>> = {
  updateOnDuplicate: ['name', 'slug', 'slugArbimon', 'latitudeNorth', 'latitudeSouth', 'longitudeEast', 'longitudeWest'],
  light: ['id', 'slug', 'name', 'latitudeNorth', 'latitudeSouth', 'longitudeEast', 'longitudeWest']
}
