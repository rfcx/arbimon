// OpenSearch mapping for the `publications` index. Full-text over title +
// abstract + authors, with keyword facets for technique/tier/year.
const publicationsMappings = {
  properties: {
    title: {
      type: 'text',
      fields: {
        suggest: { type: 'search_as_you_type' }
      }
    },
    abstract: {
      type: 'text',
      analyzer: 'simple'
    },
    authors: {
      type: 'text'
    },
    author_display: {
      type: 'keyword',
      ignore_above: 512
    },
    venue: {
      type: 'text',
      fields: {
        keyword: { type: 'keyword', ignore_above: 256 }
      }
    },
    publication_type: {
      type: 'keyword',
      ignore_above: 64
    },
    year: {
      type: 'integer'
    },
    doi: {
      type: 'keyword',
      ignore_above: 256
    },
    url: {
      type: 'keyword',
      ignore_above: 1024
    },
    cited_by_count: {
      type: 'integer'
    },
    citation_tier: {
      type: 'keyword',
      ignore_above: 1
    },
    techniques: {
      type: 'keyword'
    },
    rfcx_curated_uses: {
      type: 'text',
      fields: {
        keyword: { type: 'keyword', ignore_above: 256 }
      }
    },
    is_rfcx_authored: {
      type: 'boolean'
    },
    has_pdf: {
      type: 'boolean'
    }
  }
} as const

export const getPublicationsMappings = (): typeof publicationsMappings => {
  return publicationsMappings
}
