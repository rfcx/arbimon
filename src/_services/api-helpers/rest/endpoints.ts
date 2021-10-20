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

const WIKI = 'https://en.wikipedia.org'

export const endpointWikiMedia: Endpoint = {
  method: 'GET',
  url: `${WIKI}/w/api.php`
}

export const endpointWikiSummary: Endpoint = {
  method: 'GET',
  url: `${WIKI}/api/rest_v1/page/summary/:speciesName`
}
