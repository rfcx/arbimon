import { ShortLinkKind } from '@rfcx-bio/node-common/dao/types/short-link'

import { type Handler, type Middleware } from '~/api-helpers/types'
import { env } from '~/env'
import { createShortLink } from './dao/short-link-dao'
import { getBuiltNamespace } from './namespaces'

const { SHORT_LINK_MINT_TOKEN, ARBMN_BASE_URL } = env
const BASE_URL = (ARBMN_BASE_URL !== undefined && ARBMN_BASE_URL !== '') ? ARBMN_BASE_URL.replace(/\/$/, '') : 'https://arb.mn'
const REDIRECT_ALLOW_LIST = [/^https?:\/\/([a-z0-9-]+\.)*rfcx\.org\//i, /^https?:\/\/([a-z0-9-]+\.)*arbimon\.org\//i, /^https?:\/\/([a-z0-9-]+\.)*luca\.eco\//i]

interface MintBody {
  namespace: string
  kind?: string
  bucket?: string
  key?: string
  url?: string
  filename?: string
  contentType?: string
  expiresInSeconds?: number
  maxAccesses?: number
}

interface MintResponse {
  namespace: string
  slug: string
  url: string
  expiresAt: string | null
}

/**
 * Service-auth for the internal mint endpoint: a shared bearer token
 * (`SHORT_LINK_MINT_TOKEN`). Never exposed publicly (mint stays in-cluster).
 */
export const mintAuthHandler: Middleware = async (req, res) => {
  if (SHORT_LINK_MINT_TOKEN === undefined || SHORT_LINK_MINT_TOKEN === '') {
    await res.code(503).send({ error: 'mint_disabled' })
    return
  }
  const auth = req.headers.authorization ?? ''
  if (auth !== `Bearer ${SHORT_LINK_MINT_TOKEN}`) {
    await res.code(401).send({ error: 'unauthorized' })
  }
}

export const mintShortLinkHandler: Handler<MintResponse, unknown, unknown, MintBody> = async (req, res) => {
  const body = req.body
  const nsDef = getBuiltNamespace(body.namespace)
  if (nsDef === undefined) {
    return await res.code(400).send({ error: 'invalid_namespace' })
  }

  const kind = (body.kind as ShortLinkKind | undefined) ?? nsDef.kind

  if (kind === ShortLinkKind.DOWNLOAD) {
    if (body.key === undefined || body.key === '') {
      return await res.code(400).send({ error: 'key_required_for_download' })
    }
  } else if (kind === ShortLinkKind.REDIRECT) {
    if (body.url === undefined || !REDIRECT_ALLOW_LIST.some(re => re.test(body.url ?? ''))) {
      return await res.code(400).send({ error: 'url_missing_or_not_allow_listed' })
    }
  }

  const expiresAt = (body.expiresInSeconds !== undefined && body.expiresInSeconds > 0)
    ? new Date(Date.now() + body.expiresInSeconds * 1000)
    : undefined

  const link = await createShortLink({
    namespace: body.namespace,
    kind,
    targetBucket: body.bucket,
    targetKey: body.key,
    targetUrl: body.url,
    filename: body.filename,
    contentType: body.contentType,
    createdBy: req.headers['x-created-by'] as string | undefined,
    expiresAt,
    maxAccesses: body.maxAccesses
  })

  res.statusCode = 201
  return {
    namespace: link.namespace,
    slug: link.slug,
    url: `${BASE_URL}/${link.namespace}/${link.slug}`,
    expiresAt: link.expiresAt !== undefined ? link.expiresAt.toISOString() : null
  }
}
