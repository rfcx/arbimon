import axios, { AxiosRequestConfig } from 'axios'

export interface WikiSummary {
  title: string
  content: string
  contentUrls: {
    desktop: string
    mobile: string
  }
  thumbnailImage: string
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

const WIKI_BASE_URL = 'https://en.wikipedia.org'

export async function getWikiSpecies (scientificName: string): Promise<WikiSummary | undefined> {
  try {
    const endpoint: AxiosRequestConfig = {
      method: 'GET',
      url: `${WIKI_BASE_URL}/api/rest_v1/page/summary/${scientificName}`
    }

    const { data } = await axios.request<WikiSummaryResponse>(endpoint)
    return {
      title: data.title,
      content: data.extract,
      contentUrls: {
        desktop: data.content_urls?.desktop?.page,
        mobile: data.content_urls?.mobile?.page
      },
      thumbnailImage: data.thumbnail?.source
    }
  } catch (error) {
    console.warn('wiki/getWikiSpeciesInformation: no data ', scientificName)
    return undefined
  }
}
