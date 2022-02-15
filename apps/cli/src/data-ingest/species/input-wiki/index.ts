import { getWikiImageInfo } from './get-wiki-image-info'
import { getWikiSpecies } from './get-wiki-species'

interface WikiSummary {
  title: string
  content: string
  contentUrls: {
    desktop: string
    mobile: string
  }
  thumbnailImage: string
  credit: string
  imageInfoUrl: string
  license: string
  licenseUrl: string
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
