import { type Search } from '@opensearch-project/opensearch/api/requestParams'

import { type PublicationListItem } from '@rfcx-bio/common/api-bio/publications/publications'

import { getOpenSearchClient } from '~/opensearch'
import { type PublicationsFilter } from './publications-dao'

const PUBLICATIONS_INDEX = 'publications'

interface RawHit {
  _id: string
  _source: {
    title: string
    abstract: string | null
    authors: string[]
    author_display: string | null
    venue: string | null
    publication_type: string | null
    year: number | null
    doi: string | null
    url: string | null
    cited_by_count: number | null
    citation_tier: 'A' | 'B' | 'C'
    techniques: string[]
    rfcx_curated_uses: string | null
    is_rfcx_authored: boolean
    has_pdf: boolean
  }
}

// Full-text search of the publications index. Applies the same structured
// filters (technique/tier/year/rfcxAuthored) as the SQL DAO, but ranks by
// relevance over title + abstract + authors.
export const searchOpensearchPublications = async (filter: PublicationsFilter): Promise<{ total: number, data: PublicationListItem[] }> => {
  const opensearch = getOpenSearchClient()

  const filterClauses: Array<Record<string, unknown>> = []
  if (filter.tiers.length > 0) filterClauses.push({ terms: { citation_tier: filter.tiers } })
  if (filter.rfcxAuthored) filterClauses.push({ term: { is_rfcx_authored: true } })
  if (filter.yearFrom !== undefined || filter.yearTo !== undefined) {
    const range: Record<string, number> = {}
    if (filter.yearFrom !== undefined) range.gte = filter.yearFrom
    if (filter.yearTo !== undefined) range.lte = filter.yearTo
    filterClauses.push({ range: { year: range } })
  }
  // AND semantics: require every requested technique
  for (const tech of filter.techniques) {
    filterClauses.push({ term: { techniques: tech } })
  }

  const sortBy: Array<Record<string, unknown> | string> = filter.sort === 'citations'
    ? [{ cited_by_count: { order: 'desc' } }, '_score']
    : filter.sort === 'title'
      ? [{ author_display: { order: 'asc' } }, '_score']
      : ['_score', { year: { order: 'desc' } }]

  const params: Search<Record<string, unknown>> = {
    index: PUBLICATIONS_INDEX,
    from: filter.offset,
    size: filter.limit,
    body: {
      track_total_hits: true,
      query: {
        bool: {
          must: filter.search && filter.search.trim() !== ''
            ? [{
                multi_match: {
                  query: filter.search.trim(),
                  type: 'best_fields',
                  fields: ['title^3', 'title.suggest^2', 'abstract', 'authors', 'rfcx_curated_uses']
                }
              }]
            : [{ match_all: {} }],
          filter: filterClauses
        }
      },
      sort: sortBy
    }
  }

  const response = await opensearch.search(params)
  const body = response.body as { hits: { total: { value: number } | number, hits: RawHit[] } }
  const totalRaw = body.hits.total
  const total = typeof totalRaw === 'number' ? totalRaw : totalRaw.value

  const data: PublicationListItem[] = body.hits.hits.map(h => ({
    id: Number(h._id),
    title: h._source.title,
    year: h._source.year,
    doi: h._source.doi,
    url: h._source.url,
    venue: h._source.venue,
    publicationType: h._source.publication_type,
    authors: Array.isArray(h._source.authors) ? h._source.authors : [],
    authorDisplay: h._source.author_display,
    abstract: h._source.abstract,
    citedByCount: h._source.cited_by_count,
    citationTier: h._source.citation_tier,
    techniques: Array.isArray(h._source.techniques) ? h._source.techniques : [],
    isRfcxAuthored: h._source.is_rfcx_authored,
    rfcxCuratedUses: h._source.rfcx_curated_uses,
    hasPdf: h._source.has_pdf
  }))

  return { total, data }
}
