export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface Endpoint {
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

// ===================== WIKI API ==================

const WIKI = 'https://en.wikipedia.org/w/api.php'

export const endpointWiki: Endpoint = {
  method: 'GET',
  url: WIKI
}
