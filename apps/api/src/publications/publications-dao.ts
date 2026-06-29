import { type Sequelize, QueryTypes } from 'sequelize'

import { type PublicationListItem, type PublicationTechnique, type PublicationTechniqueCount } from '@rfcx-bio/common/api-bio/publications/publications'

export interface PublicationsFilter {
  search?: string
  techniques: string[]
  tiers: string[]
  yearFrom?: number
  yearTo?: number
  rfcxAuthored: boolean
  limit: number
  offset: number
  sort: 'year' | 'citations' | 'title'
}

// Build the shared WHERE clause + bind params for the filtered, visible publication set.
const buildWhere = (filter: PublicationsFilter): { clause: string, bind: Record<string, unknown> } => {
  const conditions: string[] = ['p.is_visible = TRUE', "p.review_status = 'approved'"]
  const bind: Record<string, unknown> = {}

  if (filter.search && filter.search.trim() !== '') {
    bind.search = `%${filter.search.trim()}%`
    conditions.push('(p.title ILIKE :search OR p.abstract ILIKE :search OR p.author_display ILIKE :search)')
  }
  if (filter.tiers.length > 0) {
    bind.tiers = filter.tiers
    conditions.push('p.citation_tier IN (:tiers)')
  }
  if (filter.yearFrom !== undefined) {
    bind.yearFrom = filter.yearFrom
    conditions.push('p.publication_year >= :yearFrom')
  }
  if (filter.yearTo !== undefined) {
    bind.yearTo = filter.yearTo
    conditions.push('p.publication_year <= :yearTo')
  }
  if (filter.rfcxAuthored) {
    conditions.push('p.is_rfcx_authored = TRUE')
  }
  if (filter.techniques.length > 0) {
    bind.techniques = filter.techniques
    // Require the publication to have ALL requested techniques (AND semantics).
    bind.techniqueCount = filter.techniques.length
    conditions.push(`p.id IN (
      SELECT publication_id FROM publication_technique
      WHERE technique_code IN (:techniques)
      GROUP BY publication_id
      HAVING COUNT(DISTINCT technique_code) = :techniqueCount
    )`)
  }

  return { clause: conditions.join(' AND '), bind }
}

export const countPublications = async (sequelize: Sequelize, filter: PublicationsFilter): Promise<number> => {
  const { clause, bind } = buildWhere(filter)
  const rows = await sequelize.query(
    `SELECT COUNT(*)::integer AS total FROM publication p WHERE ${clause}`,
    { type: QueryTypes.SELECT, replacements: bind }
  ) as unknown as Array<{ total: number }>
  return rows[0]?.total ?? 0
}

export const listPublications = async (sequelize: Sequelize, filter: PublicationsFilter): Promise<PublicationListItem[]> => {
  const { clause, bind } = buildWhere(filter)

  const orderBy = filter.sort === 'citations'
    ? 'p.cited_by_count DESC NULLS LAST, p.publication_year DESC NULLS LAST'
    : filter.sort === 'title'
      ? 'lower(p.title) ASC'
      : 'p.publication_year DESC NULLS LAST, p.cited_by_count DESC NULLS LAST'

  const rows = await sequelize.query(
    `SELECT
        p.id,
        p.title,
        p.publication_year AS "year",
        p.doi,
        p.url,
        p.venue,
        p.publication_type AS "publicationType",
        COALESCE(p.authors, '[]'::jsonb) AS authors,
        p.author_display AS "authorDisplay",
        p.abstract,
        p.cited_by_count AS "citedByCount",
        p.citation_tier AS "citationTier",
        p.is_rfcx_authored AS "isRfcxAuthored",
        p.rfcx_curated_uses AS "rfcxCuratedUses",
        (p.pdf_s3_key IS NOT NULL) AS "hasPdf",
        COALESCE(
          (SELECT array_agg(pt.technique_code ORDER BY t.sort_order)
           FROM publication_technique pt
           JOIN arbimon_technique t ON t.code = pt.technique_code
           WHERE pt.publication_id = p.id),
          ARRAY[]::varchar[]
        ) AS techniques
     FROM publication p
     WHERE ${clause}
     ORDER BY ${orderBy}
     LIMIT :limit OFFSET :offset`,
    { type: QueryTypes.SELECT, replacements: { ...bind, limit: filter.limit, offset: filter.offset } }
  ) as unknown as PublicationListItem[]

  return rows.map(r => ({ ...r, authors: Array.isArray(r.authors) ? r.authors : [], techniques: r.techniques ?? [] }))
}

// Facet counts: number of matching publications per technique, applying every
// filter EXCEPT the technique filter itself (so the user can see how many
// papers each technique would add/intersect).
export const getTechniqueFacets = async (sequelize: Sequelize, filter: PublicationsFilter): Promise<PublicationTechniqueCount[]> => {
  const facetFilter: PublicationsFilter = { ...filter, techniques: [] }
  const { clause, bind } = buildWhere(facetFilter)

  const rows = await sequelize.query(
    `SELECT t.code, t.display_name AS "displayName", t.abbreviation, COUNT(DISTINCT p.id)::integer AS count
     FROM arbimon_technique t
     LEFT JOIN publication_technique pt ON pt.technique_code = t.code
     LEFT JOIN publication p ON p.id = pt.publication_id AND ${clause}
     GROUP BY t.code, t.display_name, t.abbreviation, t.sort_order
     ORDER BY t.sort_order`,
    { type: QueryTypes.SELECT, replacements: bind }
  ) as unknown as PublicationTechniqueCount[]

  return rows
}

export const listTechniques = async (sequelize: Sequelize): Promise<PublicationTechnique[]> => {
  return await sequelize.query(
    `SELECT code, display_name AS "displayName", abbreviation, description, sort_order AS "sortOrder"
     FROM arbimon_technique ORDER BY sort_order`,
    { type: QueryTypes.SELECT }
  ) as unknown as PublicationTechnique[]
}
