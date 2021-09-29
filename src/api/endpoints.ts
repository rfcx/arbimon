export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface Endpoint {
  method: RequestMethod
  url: string
}

const CORE = 'https://staging-api.rfcx.org'

// Example: to be updated
export const getSites: Endpoint = {
  method: 'GET',
  url: `${CORE}/streams`
}

export const getProjects: Endpoint = {
  method: 'GET',
  url: `${CORE}/projects`
}
