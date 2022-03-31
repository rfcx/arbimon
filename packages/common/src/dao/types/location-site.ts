// TODO: Rename this to LocationSite & update references
export interface Site {
  id: number
  idCore: string
  idArbimon: number
  projectId: number
  name: string
  latitude: number
  longitude: number
  altitude: number
}

export const ATTRIBUTES_LOCATION_SITE: Record<string, Array<keyof Site>> = {
  light: ['id', 'name', 'latitude', 'longitude', 'altitude'],
  updateOnDuplicate: ['idCore', 'name', 'latitude', 'longitude', 'altitude']
}
