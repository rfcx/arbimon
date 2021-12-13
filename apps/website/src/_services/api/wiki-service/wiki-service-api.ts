import axios, { AxiosRequestConfig } from 'axios'

import { WikiSummary } from '~/api/wiki-service/types'

export function mapSpecies (scientificName: string): string {
  switch (scientificName) {
    // None sub species on wiki
    case ('Contopus latirostris blancoi'): return 'Contopus latirostris'
    default: return scientificName
  }
}

export class WikiService {
  constructor (private readonly baseUrl: string) {}

  async getSpeciesSummary (sciencetificName: string): Promise<WikiSummary | undefined> {
    const scientificName = mapSpecies(sciencetificName)
    try {
      const endpoint: AxiosRequestConfig = ({
        method: 'GET',
        url: `${this.baseUrl}/api/rest_v1/page/summary/${scientificName}`
      })

      const { data } = await axios.request<WikiSummaryResponse>(endpoint)
      return {
        content: data.extract,
        contentUrls: {
          desktop: data.content_urls?.desktop?.page,
          mobile: data.content_urls?.mobile?.page
        },
        thumbnailImage: data.thumbnail?.source
      }
    } catch (e) {
      // TODO #191: API Handle
      return undefined
    }
  }
}

interface WikiSummaryResponse {
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
