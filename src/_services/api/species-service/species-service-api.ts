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
      url: url.replace(':speciesName', speciesName)
    })
    const data = response.data

    return {
      type: data.type,
      title: data.title,
      displayTitle: data.displaytitle,
      namespace: {
        id: data.namespace?.id,
        text: data.namespace?.text
      },
      wikibaseItem: data.wikibase_item,
      titles: {
        canonical: data.titles?.canonical,
        normalized: data.titles?.normalized,
        display: data.titles?.display
      },
      pageId: data.pageid,
      thumbnail: {
        source: data.thumbnail?.source,
        width: data.thumbnail?.width,
        height: data.thumbnail?.height
      },
      originalImage: {
        source: data.originalimage?.source,
        width: data.originalimage?.width,
        height: data.originalimage?.height
      },
      lang: data.lang,
      dir: data.dir,
      revision: data.revision,
      tid: data.tid,
      timestamp: data.timestamp,
      description: data.description,
      descriptionSource: data.description_source,
      contentUrls: {
        desktop: {
          page: data.content_urls?.desktop?.page,
          revisions: data.content_urls?.desktop?.revisions,
          edit: data.content_urls?.desktop?.edit,
          talk: data.content_urls?.desktop?.talk
        },
        mobile: {
          page: data.content_urls?.mobile?.page,
          revisions: data.content_urls?.mobile?.revisions,
          edit: data.content_urls?.mobile?.edit,
          talk: data.content_urls?.mobile?.talk
        }
      },
      content: data.extract,
      contentHtml: data.extract_html
    }
  } catch (e) {
    //
  }
}
