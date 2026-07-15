import { type RouteRegistration, GET, POST } from '~/api-helpers/types'
import { mintAuthHandler, mintShortLinkHandler } from './mint-handler'
import { resolveShortLinkHandler } from './resolve-handler'

/**
 * `arb.mn` shortlink surface (rfcx-local OPEN-ITEMS #62). Served on the `arb.mn`
 * hostname via the edge (public-router → biodiversity-api). Namespaced:
 * `arb.mn/<ns>/<slug>` (2-char `[a-z]` namespace registry, see ./namespaces.ts).
 *
 * - Resolve is PUBLIC (email recipients are not logged in). It only ever exposes
 *   built namespaces; unknown ones 404.
 * - Mint is INTERNAL (shared bearer token) and must NOT be exposed publicly at
 *   the edge — the public-router only proxies the `^/[a-z]{2}/` resolve paths.
 */
export const routesShortLink: RouteRegistration[] = [
  {
    method: POST,
    url: '/internal/short-links',
    preHandler: [mintAuthHandler],
    handler: mintShortLinkHandler
  },
  {
    // Regex-constrained param: only a 2-lowercase-letter first segment can match,
    // so this cannot shadow the main biodiversity-api routes (which are longer,
    // static-first segments and take priority in find-my-way anyway). Host
    // separation (arb.mn only) is additionally enforced at the edge
    // (public-router proxies just `^/[a-z]{2}/` on the arb.mn server block).
    method: GET,
    url: '/:namespace(^[a-z]{2}$)/:slug',
    handler: resolveShortLinkHandler
  }
]
