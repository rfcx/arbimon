/**
 * A row in `short_link` — the backing store for the `arb.mn` namespaced
 * shortlink surface. See rfcx-local
 * `runbooks/DESIGN-arbmn-shortlink-download-service-2026-07-15.md`.
 */

export enum ShortLinkKind {
  /** Stream `targetBucket`/`targetKey` from storage through the API. */
  DOWNLOAD = 'download',
  /** 302-redirect to an allow-listed `targetUrl`. */
  REDIRECT = 'redirect'
}

export interface ShortLink {
  id: number
  /** Registry key, e.g. `dl` (download). The `arb.mn/<namespace>/` segment. */
  namespace: string
  /** Public id in `arb.mn/<namespace>/<slug>`. Unique per namespace. */
  slug: string
  kind: ShortLinkKind
  /** For `download`: storage bucket. */
  targetBucket?: string
  /** For `download`: object key. */
  targetKey?: string
  /** For `redirect`: absolute allow-listed URL. */
  targetUrl?: string
  /** Content-Disposition filename for downloads. */
  filename?: string
  /** Optional Content-Type override; else taken from object metadata. */
  contentType?: string
  /** Issuer (service/user id) for audit. */
  createdBy?: string
  createdAt: Date
  /** null = no expiry. */
  expiresAt?: Date
  /** Optional access cap (e.g. one-time links). */
  maxAccesses?: number
  accessCount: number
  /** Soft kill switch. */
  revokedAt?: Date
}
