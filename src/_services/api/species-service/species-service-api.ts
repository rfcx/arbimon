// TODO ???: Make the real API

import axios from 'axios'

import { WikiEndpoints } from '../../api-helpers/rest'
import { WikiSummary, WikiSummaryResponse } from './types'

// =================== WIKI ====================
export const getSpeciesSummary = async (speciesName: string): Promise<WikiSummary | undefined> => {
  const { method, url } = WikiEndpoints.endpointWikiSummary

  try {
    const response = await axios.request<WikiSummaryResponse>({
      method,
      url: url(speciesName)
    })
    const data = response.data

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
