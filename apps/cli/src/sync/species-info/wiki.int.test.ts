import { Op } from 'sequelize'
import { afterEach, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { truncateEllipsis } from '@rfcx-bio/utils/string'

import { getSequelize } from '@/db/connections'
import { rawTaxonClasses } from '@/db/seeders/_data/taxon-class'
import { getWikiSummary } from '@/sync/_refactor/input-wiki'
import { syncWikiSpeciesInfo } from './wiki'

const biodiversitySequelize = getSequelize()
const { TaxonSpecies, TaxonSpeciesPhoto, TaxonSpeciesWiki } = ModelRepository.getInstance(biodiversitySequelize)

const BIRDS_ID = rawTaxonClasses[3].id

vi.mock('@/sync/_refactor/input-wiki', () => {
  return {
    getWikiSummary: vi.fn()
  }
})

const DEFAULT_SPECIES = {
  idArbimon: 10795,
  slug: 'bogus-malogus',
  taxonClassId: BIRDS_ID,
  scientificName: 'Bogus Malogus'
}
const DEFAULT_WIKI_INFO = {
  title: 'Bogus Malogus',
  content: 'Random description',
  contentUrls: {
    desktop: 'https://en.wikipedia.org/wiki/Bogus_malogus',
    mobile: 'https://en.wikipedia.org/wiki/Bogus_malogus'
  },
  thumbnailImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Bogus_malogus_-_MG_9666.jpg',
  credit: 'Francesco Veronesi',
  imageInfoUrl: '',
  license: 'CC BY-SA 2.0',
  licenseUrl: 'https://en.wikipedia.org/wiki/Bogus_malogus#/media/File:Bogus_Malogus_-_MG_9666.jpg'
}

afterEach(async () => {
  const species = await TaxonSpecies.findAll({ attributes: ['id'], where: { slug: DEFAULT_SPECIES.slug } })
  await TaxonSpeciesWiki.destroy({ where: { taxonSpeciesId: { [Op.in]: species.map(s => s.id) } } })
  await TaxonSpeciesPhoto.destroy({ where: { taxonSpeciesId: { [Op.in]: species.map(s => s.id) } } })
  await TaxonSpecies.destroy({ where: { slug: DEFAULT_SPECIES.slug } })
})

test('truncate long author field', async () => {
  // Arrange
  const species = await TaxonSpecies.create(DEFAULT_SPECIES)
  const longCredit = 'x'.repeat(1024);
  (getWikiSummary as any).mockResolvedValueOnce({ ...DEFAULT_WIKI_INFO, credit: longCredit })

  // Act
  await syncWikiSpeciesInfo(biodiversitySequelize, { [species.scientificName]: species.id })

  // Assert
  const photos = await TaxonSpeciesPhoto.findAll({ where: { taxonSpeciesId: species.id } })
  expect(photos).toHaveLength(1)
  expect(photos[0].photoAuthor).toEqual(truncateEllipsis(longCredit, 1023))
})
