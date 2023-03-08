import axios, { type AxiosRequestConfig } from 'axios'

import { logError } from '~/axios'
import { requireEnv } from '~/env'

export interface WikiMediaImageInfo {
  descriptionurl: string
  extmetadata: Record<'LicenseShortName' | 'Artist' | 'Copyrighted', { value: string, source: string, hidden?: string }> & { LicenseUrl?:
    { value: string, source: string, hidden?: string }
  }
}

interface WikiMediaResponse {
  batchcomplete: string
  query: {
    pages: Record<string, {
      imageinfo?: WikiMediaImageInfo[]
    }>
  }
}

// TODO: This should be injected by the script controller
const { WIKI_MEDIA_BASE_URL } = requireEnv('WIKI_MEDIA_BASE_URL')

export async function getWikiImageInfo (fileName: string | undefined): Promise<WikiMediaImageInfo | undefined> {
  if (!fileName) return undefined
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    url: `${WIKI_MEDIA_BASE_URL}/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata|url&format=json&titles=File:${fileName}`
  }

  return await axios.request<WikiMediaResponse>(endpoint)
    .then(res => {
      const data = res.data.query.pages['-1']?.imageinfo?.[0]
      if (!data) {
        console.info(res.status, 'getWikiImageInfo', fileName, '(no data)')
        return undefined
      }

      console.info(res.status, 'getWikiImageInfo', fileName)
      return {
        descriptionurl: data.descriptionurl,
        extmetadata: data.extmetadata
      }
    })
    .catch(logError('getWikiImageInfo', fileName))
}
