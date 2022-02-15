import { getWikiImageInfo } from './get-wiki-image-info'
import { getWikiSpecies } from './get-wiki-species'

export interface WikiSummary {
  title: string
  content: string
  contentUrls: {
    desktop: string
    mobile: string
  }
  thumbnailImage?: string
  credit?: string
  imageInfoUrl?: string
  license?: string
  licenseUrl?: string
}

export const getWikiSummary = async (scientificName: string): Promise<WikiSummary | undefined> => {
  const wikiSpecies = await getWikiSpecies(scientificName)
  if (!wikiSpecies) return undefined

  const fileName = wikiSpecies?.originalimage?.source.split('/').at(-1)
  const wikiImageInfo = await getWikiImageInfo(fileName)

  return {
    title: wikiSpecies?.title ?? '',
    content: wikiSpecies?.extract ?? '',
    contentUrls: {
      desktop: wikiSpecies?.content_urls?.desktop?.page ?? '',
      mobile: wikiSpecies?.content_urls?.mobile?.page ?? ''
    },
    thumbnailImage: wikiSpecies?.thumbnail?.source,
    credit: wikiImageInfo?.extmetadata.Artist?.value,
    ...(wikiImageInfo?.extmetadata.Copyrighted
      ? {
        imageInfoUrl: wikiImageInfo?.descriptionurl,
        license: wikiImageInfo?.extmetadata.LicenseShortName.value,
        licenseUrl: wikiImageInfo?.extmetadata.LicenseUrl?.value
      }
      : {}
    )
  }
}
