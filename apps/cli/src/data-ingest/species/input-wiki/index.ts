import axios, { AxiosRequestConfig } from 'axios'

import { requireEnv } from '~/env'
import { WikiMediaImageInfo, WikiMediaResponse, WikiSummary, WikiSummaryResponse } from './wiki-info-type'

// TODO: This should be injected by the script controller
const { WIKI_BASE_URL, WIKI_MEDIA_BASE_URL } = requireEnv('WIKI_BASE_URL', 'WIKI_MEDIA_BASE_URL')

async function getWikiSpecies (scientificName: string): Promise<WikiSummaryResponse| undefined> {
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    url: `${WIKI_BASE_URL}/api/rest_v1/page/summary/${scientificName}`
  }

  return await axios.request<WikiSummaryResponse>(endpoint)
    .then(res => {
      return res.data
    })
    .catch(() => {
      return undefined
    })
}

async function getWikiImageInfo (fileName: string | undefined): Promise<WikiMediaImageInfo | undefined> {
  if (!fileName) return undefined
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    url: `${WIKI_MEDIA_BASE_URL}/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata|url&format=json&titles=File:${fileName}`
  }

  return await axios.request<WikiMediaResponse>(endpoint)
    .then(res => {
    const data = res.data.query.pages['-1']?.imageinfo[0]
    return {
      descriptionurl: data.descriptionurl,
      extmetadata: data.extmetadata
    }
  }).catch(() => {
    return undefined
  })
}

export const getWikiSummary = async (scientificName: string): Promise<WikiSummary> => {
  const wikiSpecies = await getWikiSpecies(scientificName)
  const fileName = wikiSpecies?.originalimage?.source.split('/').at(-1)
  const wikiImageInfo = await getWikiImageInfo(fileName)
  const hasCopyRighted = (info: string | undefined): string => {
    if (!info) return ''
    return wikiImageInfo?.extmetadata.Copyrighted ? info : ''
  }

  return {
    title: wikiSpecies?.title ?? '',
    content: wikiSpecies?.extract ?? '',
    contentUrls: {
      desktop: wikiSpecies?.content_urls?.desktop?.page ?? '',
      mobile: wikiSpecies?.content_urls?.mobile?.page ?? ''
    },
    thumbnailImage: wikiSpecies?.thumbnail?.source ?? '',
    credit: wikiImageInfo?.extmetadata.Artist.value ?? '',
    imageInfoUrl: hasCopyRighted(wikiImageInfo?.descriptionurl),
    license: hasCopyRighted(wikiImageInfo?.extmetadata.LicenseShortName.value),
    licenseUrl: hasCopyRighted(wikiImageInfo?.extmetadata.LicenseUrl?.value)
  }
}
