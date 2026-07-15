import { ShortLinkKind } from '@rfcx-bio/node-common/dao/types/short-link'

/**
 * `arb.mn` namespace registry.
 *
 * Every `arb.mn` URL is `arb.mn/<namespace>/<slug>` where `<namespace>` is a
 * short (2-char) registry key. This map is the authoritative list of which
 * namespaces exist and how each resolves. Reserve a key here (and add a handler
 * branch) when a namespace is actually built — keep in sync with rfcx-local
 * `runbooks/DESIGN-arbmn-shortlink-download-service-2026-07-15.md` §3.
 *
 * Only `dl` (download) is implemented today; the rest are reserved names so two
 * features never claim the same key.
 */
export interface NamespaceDef {
  key: string
  description: string
  kind: ShortLinkKind
  built: boolean
}

export const NAMESPACES: Record<string, NamespaceDef> = {
  dl: { key: 'dl', description: 'Secure streamed file download', kind: ShortLinkKind.DOWNLOAD, built: true },
  // Reserved (not built):
  go: { key: 'go', description: 'Generic short redirect (allow-listed hosts)', kind: ShortLinkKind.REDIRECT, built: false },
  pr: { key: 'pr', description: 'Deep-link to an Arbimon project', kind: ShortLinkKind.REDIRECT, built: false },
  ac: { key: 'ac', description: 'User / account links (invites, unsubscribes)', kind: ShortLinkKind.REDIRECT, built: false },
  ap: { key: 'ap', description: 'App install / asset', kind: ShortLinkKind.REDIRECT, built: false },
  im: { key: 'im', description: 'Image / media short links', kind: ShortLinkKind.DOWNLOAD, built: false },
  sh: { key: 'sh', description: 'Public share of a view/result', kind: ShortLinkKind.REDIRECT, built: false },
  qr: { key: 'qr', description: 'QR-code targets (print/field campaigns)', kind: ShortLinkKind.REDIRECT, built: false }
}

/** A namespace segment must be 2 lowercase letters. */
export const NAMESPACE_PATTERN = /^[a-z]{2}$/

export const isValidNamespaceSegment = (ns: string): boolean => NAMESPACE_PATTERN.test(ns)

/** Returns the registry def for a built namespace, else undefined. */
export const getBuiltNamespace = (ns: string): NamespaceDef | undefined => {
  const def = NAMESPACES[ns]
  return def?.built ? def : undefined
}
