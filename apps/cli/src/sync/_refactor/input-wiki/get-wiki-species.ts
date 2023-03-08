import axios, { type AxiosRequestConfig } from 'axios'

import { logError } from '~/axios'
import { requireEnv } from '~/env'

export interface WikiSummaryResponse {
  type: string
  title: string
  displaytitle: string
  namespace: {
    id: number
    text: string
  }
  wikibase_item: string
  titles: {
    canonical: string
    normalized: string
    display: string
  }
  pageid: number
  thumbnail: {
    source: string
    width: number
    height: number
  }
  originalimage: {
    source: string
    width: number
    height: number
  }
  lang: string
  dir: string
  revision: string
  tid: string
  timestamp: string
  description: string
  description_source: string
  content_urls: {
    desktop: {
      page: string
      revisions: string
      edit: string
      talk: string
    }
    mobile: {
      page: string
      revisions: string
      edit: string
      talk: string
    }
  }
  extract: string
  extract_html: string
}

// TODO: This should be injected by the script controller
const { WIKI_BASE_URL } = requireEnv('WIKI_BASE_URL')

export async function getWikiSpecies (scientificName: string): Promise<WikiSummaryResponse | undefined> {
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    url: `${WIKI_BASE_URL}/api/rest_v1/page/summary/${scientificName}`
  }

  return await axios.request<WikiSummaryResponse>(endpoint)
    .then(res => {
      console.info(res.status, 'getWikiSpecies', scientificName)
      return res.data
    })
    .catch(logError('getWikiSpecies', scientificName))
}
