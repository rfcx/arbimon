import { Method } from 'axios'

export type RequestMethod = Method & ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')

export interface Endpoint {
  method: RequestMethod
  url: string
}

const CORE = 'https://staging-api.rfcx.org'

// Example: to be updated
export const endpointSites: Endpoint = {
  method: 'GET',
  url: `${CORE}/streams`
}

export const endpointProjects: Endpoint = {
  method: 'GET',
  url: `${CORE}/projects`
}
