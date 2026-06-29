import { QueryTypes } from 'sequelize'

import { type LandingPublicationsResponse, type Publication } from '@rfcx-bio/common/api-bio/landing/landing-publications'

import { getSequelize } from '~/db'

// Backed by the `publication` table in the insights DB (replaces the legacy
// hand-maintained Google Sheet). Returns the RFCx-curated subset to preserve
// the original endpoint's "publications using RFCx/Arbimon" semantics + shape.
interface PublicationRow {
  type: string | null
  author: string | null
  year: number | null
  title: string
  journal: string | null
  doiUrl: string | null
  isRfcxAuthor: boolean
  orgMention: string | null
  uses: string | null
  citations: number | null
}

export const getPublications = async (): Promise<LandingPublicationsResponse> => {
  const sequelize = getSequelize()

  const rows = await sequelize.query(
    `SELECT
        COALESCE(sheet_mention_type, 'Use') AS "type",
        COALESCE(author_display, '') AS author,
        publication_year AS "year",
        title,
        COALESCE(venue, '') AS journal,
        CASE WHEN doi IS NOT NULL THEN 'https://doi.org/' || doi ELSE COALESCE(url, '') END AS "doiUrl",
        is_rfcx_authored AS "isRfcxAuthor",
        COALESCE(rfcx_curated_uses, '') AS "orgMention",
        COALESCE(rfcx_curated_uses, '') AS uses,
        COALESCE(cited_by_count, 0) AS citations
     FROM publication
     WHERE in_rfcx_curated_list = TRUE
       AND is_visible = TRUE
       AND review_status = 'approved'
     ORDER BY publication_year DESC NULLS LAST, lower(title) ASC`,
    { type: QueryTypes.SELECT }
  ) as unknown as PublicationRow[]

  return rows.map((r): Publication => ({
    type: (r.type === 'Mention' || r.type === 'Co-author' ? r.type : 'Use'),
    author: r.author ?? '',
    year: r.year ?? 0,
    title: r.title,
    journal: r.journal ?? '',
    doiUrl: r.doiUrl ?? '',
    isRFCxAuthor: r.isRfcxAuthor,
    orgMention: r.orgMention ?? '',
    uses: r.uses ?? '',
    citations: r.citations ?? 0
  }))
}
