import axios from 'axios'

import { WikiSummary } from '~/api/wiki-service/types'
import { Endpoint } from '~/api-helpers/rest'

export class WikiService {
  constructor (private readonly baseUrl: string) {}

  async getSpeciesSummary (speciesName: string): Promise<WikiSummary | undefined> {
    try {
      const endpoint: Endpoint = ({
        method: 'GET',
        url: `${this.baseUrl}/api/rest_v1/page/summary/${speciesName}`
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
