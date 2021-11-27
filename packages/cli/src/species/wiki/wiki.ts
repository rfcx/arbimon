import axios, { AxiosRequestConfig } from 'axios'
import { WikiSummary, WikiSummaryResponse } from 'species/wiki/types'

const WIKI_BASE_URL = 'https://en.wikipedia.org'

export async function getWikiSpeciesInformation (speciesName: string): Promise<WikiSummary | undefined> {
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    url: `${WIKI_BASE_URL}/api/rest_v1/page/summary/${speciesName}`
  }

  const { data } = await axios.request<WikiSummaryResponse>(endpoint)
  return {
    content: data.extract,
    contentUrls: {
      desktop: data.content_urls?.desktop?.page,
      mobile: data.content_urls?.mobile?.page
    },
    thumbnailImage: data.thumbnail?.source
  }
}
