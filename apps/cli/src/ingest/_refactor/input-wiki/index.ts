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

const PHOTO_LICENSES_ALLOWED = new Set([
  'CC BY 2.0',
  'CC BY 2.0 de',
  'CC BY 2.5',
  'CC BY 3.0',
  'CC BY 4.0',
  'CC BY-SA 2.0',
  'CC BY-SA 2.5',
  'CC BY-SA 3.0',
  'CC BY-SA 4.0',
  'CC-BY-SA-3.0',
  'CC0',
  'Copyrighted free use',
  'Public domain'
])

const PHOTO_LICENSES_DISALLOWED = new Set<string>([])

export const getWikiSummary = async (scientificName: string): Promise<WikiSummary | undefined> => {
  // Rename not support species name and sub species name to species name
  const words = scientificName.split(' ')
  const speciesName = words.length <= 2 ? scientificName : words.slice(0, 2).join(' ')

  if (words.length > 2) {
    console.info(`WIKI: Rename '${scientificName}' to '${speciesName}'`)
  }

  // Call Wiki API
  const wikiSpecies = await getWikiSpecies(speciesName)
  if (!wikiSpecies) return undefined

  const wikiSpeciesData: WikiSummary = {
    title: wikiSpecies?.title ?? '',
    content: wikiSpecies?.extract ?? '',
    contentUrls: {
      desktop: wikiSpecies?.content_urls?.desktop?.page ?? '',
      mobile: wikiSpecies?.content_urls?.mobile?.page ?? ''
    }
  }

  // Call Wiki image API
  const fileName = wikiSpecies?.originalimage?.source.split('/').at(-1)
  if (!fileName) return wikiSpeciesData

  const wikiImageInfo = await getWikiImageInfo(fileName)

  // Check license
  const photoLicense = wikiImageInfo?.extmetadata?.LicenseShortName?.value ?? ''
  const isPhotoLicenseOk = PHOTO_LICENSES_ALLOWED.has(photoLicense)
  if (photoLicense && !isPhotoLicenseOk && !PHOTO_LICENSES_DISALLOWED.has(photoLicense)) {
    console.warn(`Rejected new license: ${photoLicense} for ${scientificName} (${fileName ?? ''})`)
  }
  if (!isPhotoLicenseOk) return wikiSpeciesData

  return {
    ...wikiSpeciesData,
    thumbnailImage: wikiSpecies?.thumbnail?.source,
    credit: wikiImageInfo?.extmetadata.Artist?.value
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .replace(/\s+/, ' ') // Remove linebreak
      .trim(), // Remove trailing whitespace
    imageInfoUrl: wikiImageInfo?.descriptionurl,
    license: wikiImageInfo?.extmetadata.LicenseShortName.value,
    licenseUrl: `${wikiSpecies?.content_urls?.desktop?.page}#/media/File:${fileName}`
  }
}
