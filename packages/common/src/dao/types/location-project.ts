// TODO: Rename this to LocationProject & update references
export interface Project {
  id: number
  idCore: string
  idArbimon: number
  slug: string
  slugArbimon: string
  isPublished: boolean
  name: string
  latitudeNorth: number
  latitudeSouth: number
  longitudeEast: number
  longitudeWest: number
}
