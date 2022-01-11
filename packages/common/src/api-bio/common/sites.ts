// Request
export interface SitesParams {
  projectId: string
}

export const sitesRoute = '/projects/:projectId/sites'

export const sitesUrl = (params: SitesParams): string =>
  `/projects/${params.projectId}/sites`

// Response
export type SitesResponse = Site[]

// Models
export interface Site {
  siteId: string
  name: string
  latitude: number
  longitude: number
  altitude: number
}
