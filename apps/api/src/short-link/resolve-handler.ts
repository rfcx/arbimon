import { ShortLinkKind } from '@rfcx-bio/node-common/dao/types/short-link'

import { type Handler } from '~/api-helpers/types'
import { getS3Client } from '~/storage'
import { resolveAndConsume } from './dao/short-link-dao'
import { getBuiltNamespace, isValidNamespaceSegment } from './namespaces'

interface ResolveParams {
  namespace: string
  slug: string
}

/**
 * Public resolver for `arb.mn/<namespace>/<slug>`.
 *
 * - Invalid/unregistered/unbuilt namespace → 404.
 * - Missing / revoked / expired / over-cap link → 404.
 * - `download` → stream the object from private storage (never expose the
 *   storage URL); `Content-Disposition: attachment`.
 * - `redirect` → 302 to the stored (allow-listed) target URL.
 */
export const resolveShortLinkHandler: Handler<unknown, ResolveParams> = async (req, res) => {
  const { namespace, slug } = req.params

  if (!isValidNamespaceSegment(namespace) || getBuiltNamespace(namespace) === undefined) {
    return await res.code(404).send({ error: 'not_found' })
  }

  const link = await resolveAndConsume(namespace, slug)
  if (link === null) {
    return await res.code(404).send({ error: 'not_found' })
  }

  if (link.kind === ShortLinkKind.REDIRECT) {
    if (link.targetUrl === undefined) {
      return await res.code(404).send({ error: 'not_found' })
    }
    return await res.redirect(302, link.targetUrl)
  }

  // download
  if (link.targetKey === undefined) {
    return await res.code(404).send({ error: 'not_found' })
  }

  const storage = getS3Client()
  let object
  try {
    object = await storage.getObjectStream(link.targetKey, link.targetBucket)
  } catch (err) {
    req.log.error({ err, namespace, slug }, 'short-link: storage fetch failed')
    return await res.code(502).send({ error: 'storage_unavailable' })
  }

  const contentType = link.contentType ?? object.contentType ?? 'application/octet-stream'
  const filename = sanitizeFilename(link.filename) ?? `${slug}`

  void res.header('Content-Type', contentType)
  void res.header('Content-Disposition', `attachment; filename="${filename}"`)
  void res.header('Cache-Control', 'private, no-store')
  if (object.contentLength !== undefined) {
    void res.header('Content-Length', String(object.contentLength))
  }

  return await res.send(object.stream)
}

// Strip anything that could break the header / path-traverse the filename.
const sanitizeFilename = (name?: string): string | undefined => {
  if (name === undefined) return undefined
  const cleaned = name.replace(/[\r\n"\\/]+/g, '').trim()
  return cleaned.length > 0 ? cleaned : undefined
}
