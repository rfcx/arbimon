import { QueryTypes } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type ShortLink, type ShortLinkKind } from '@rfcx-bio/node-common/dao/types/short-link'

import { getSequelize } from '~/db'
import { generateSlug } from './slug'

export interface CreateShortLinkInput {
  namespace: string
  kind: ShortLinkKind
  targetBucket?: string
  targetKey?: string
  targetUrl?: string
  filename?: string
  contentType?: string
  createdBy?: string
  expiresAt?: Date
  maxAccesses?: number
}

/**
 * Creates a short link, retrying on the (rare) slug collision within a
 * namespace. Returns the persisted row.
 */
export const createShortLink = async (input: CreateShortLinkInput): Promise<ShortLink> => {
  const sequelize = getSequelize()
  const { ShortLink } = ModelRepository.getInstance(sequelize)

  const MAX_ATTEMPTS = 5
  let lastErr: unknown
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const slug = generateSlug()
    try {
      const row = await ShortLink.create({
        namespace: input.namespace,
        slug,
        kind: input.kind,
        targetBucket: input.targetBucket,
        targetKey: input.targetKey,
        targetUrl: input.targetUrl,
        filename: input.filename,
        contentType: input.contentType,
        createdBy: input.createdBy,
        createdAt: new Date(),
        expiresAt: input.expiresAt,
        maxAccesses: input.maxAccesses,
        accessCount: 0
      })
      return row.get({ plain: true })
    } catch (err) {
      lastErr = err
      // Unique-violation on (namespace, slug) → retry with a fresh slug.
    }
  }
  throw lastErr ?? new Error('Failed to create short link')
}

/**
 * Atomically resolves + consumes a short link: increments access_count and
 * returns the row ONLY if it is live (not revoked, not expired, not over
 * max_accesses). Returns null otherwise. The guard + increment happen in ONE
 * statement so concurrent hits cannot exceed max_accesses.
 */
export const resolveAndConsume = async (namespace: string, slug: string): Promise<ShortLink | null> => {
  const sequelize = getSequelize()

  const rows = await sequelize.query<ShortLinkRow>(
    `UPDATE short_link
        SET access_count = access_count + 1
      WHERE namespace = :namespace
        AND slug = :slug
        AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_accesses IS NULL OR access_count < max_accesses)
      RETURNING id, namespace, slug, kind,
                target_bucket, target_key, target_url,
                filename, content_type, created_by,
                created_at, expires_at, max_accesses, access_count, revoked_at`,
    {
      replacements: { namespace, slug },
      type: QueryTypes.SELECT
    }
  )

  const row = rows[0]
  if (row === undefined) return null
  return rowToShortLink(row)
}

interface ShortLinkRow {
  id: number
  namespace: string
  slug: string
  kind: string
  target_bucket: string | null
  target_key: string | null
  target_url: string | null
  filename: string | null
  content_type: string | null
  created_by: string | null
  created_at: Date
  expires_at: Date | null
  max_accesses: number | null
  access_count: number
  revoked_at: Date | null
}

const rowToShortLink = (row: ShortLinkRow): ShortLink => ({
  id: row.id,
  namespace: row.namespace,
  slug: row.slug,
  kind: row.kind as ShortLinkKind,
  targetBucket: row.target_bucket ?? undefined,
  targetKey: row.target_key ?? undefined,
  targetUrl: row.target_url ?? undefined,
  filename: row.filename ?? undefined,
  contentType: row.content_type ?? undefined,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  expiresAt: row.expires_at ?? undefined,
  maxAccesses: row.max_accesses ?? undefined,
  accessCount: row.access_count,
  revokedAt: row.revoked_at ?? undefined
})
