import { Endpoint } from './endpoints'

const WIKI = 'https://en.wikipedia.org'

export const endpointWikiMedia: Endpoint = {
  method: 'GET',
  url: `${WIKI}/w/api.php`
}

export const endpointWikiSummary: Omit<Endpoint, 'url'> & { url: ([key]: string) => string } = {
  method: 'GET',
  url: (speciesName: string) => `${WIKI}/api/rest_v1/page/summary/${speciesName}`
}
