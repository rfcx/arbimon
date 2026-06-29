import { type Dayjs } from 'dayjs'
import { type Sequelize, QueryTypes } from 'sequelize'

export const PUBLICATIONS_INDEX_NAME = 'publications'

export interface PublicationDocument {
  id: number
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
  citation_tier: string
  techniques: string[]
  rfcx_curated_uses: string | null
  is_rfcx_authored: boolean
  has_pdf: boolean
}

const BASE_SELECT = `
  SELECT
    p.id,
    p.title,
    p.abstract,
    COALESCE(p.authors, '[]'::jsonb) AS authors,
    p.author_display,
    p.venue,
    p.publication_type,
    p.publication_year AS year,
    p.doi,
    p.url,
    p.cited_by_count,
    p.citation_tier,
    COALESCE(
      (SELECT array_agg(pt.technique_code ORDER BY t.sort_order)
       FROM publication_technique pt
       JOIN arbimon_technique t ON t.code = pt.technique_code
       WHERE pt.publication_id = p.id),
      ARRAY[]::varchar[]
    ) AS techniques,
    p.rfcx_curated_uses,
    p.is_rfcx_authored,
    (p.pdf_s3_key IS NOT NULL) AS has_pdf
  FROM publication p
`

const normalize = (rows: PublicationDocument[]): PublicationDocument[] =>
  rows.map(r => ({ ...r, authors: Array.isArray(r.authors) ? r.authors : [], techniques: r.techniques ?? [] }))

// Visible + approved publications (eligible for the public index).
export const getEligiblePublications = async (sequelize: Sequelize, updatedAfter?: Dayjs): Promise<PublicationDocument[]> => {
  const conditions = ['p.is_visible = TRUE', "p.review_status = 'approved'"]
  const bind: Record<string, unknown> = {}
  if (updatedAfter) {
    conditions.push('p.updated_at >= :updatedAfter')
    bind.updatedAfter = updatedAfter.toISOString()
  }
  const rows = await sequelize.query(
    `${BASE_SELECT} WHERE ${conditions.join(' AND ')} ORDER BY p.id`,
    { type: QueryTypes.SELECT, replacements: bind }
  ) as unknown as PublicationDocument[]
  return normalize(rows)
}

// Publications that should NOT be in the index (hidden/pending), optionally only
// those changed since the checkpoint — used to remove docs that became ineligible.
export const getIneligiblePublications = async (sequelize: Sequelize, updatedAfter?: Dayjs): Promise<Array<{ id: number }>> => {
  const conditions = ["(p.is_visible = FALSE OR p.review_status <> 'approved')"]
  const bind: Record<string, unknown> = {}
  if (updatedAfter) {
    conditions.push('p.updated_at >= :updatedAfter')
    bind.updatedAfter = updatedAfter.toISOString()
  }
  const rows = await sequelize.query(
    `SELECT p.id FROM publication p WHERE ${conditions.join(' AND ')} ORDER BY p.id`,
    { type: QueryTypes.SELECT, replacements: bind }
  ) as unknown as Array<{ id: number }>
  return rows
}
