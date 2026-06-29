import { type PublicationsQueryParams, type PublicationsResponse, type PublicationTechnique } from '@rfcx-bio/common/api-bio/publications/publications'

import { type Handler } from '~/api-helpers/types'
import { getPublications, getPublicationTechniques } from './publications-bll'
import { type PublicationsFilter } from './publications-dao'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

const toArray = (v: string | string[] | undefined): string[] => {
  if (v === undefined) return []
  return Array.isArray(v) ? v : [v]
}

const toIntOrUndefined = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : undefined
}

const ALLOWED_TIERS = new Set(['A', 'B', 'C'])
const ALLOWED_SORT = new Set(['year', 'citations', 'title'])

export const publicationsHandler: Handler<PublicationsResponse, unknown, PublicationsQueryParams> = async (req, res) => {
  const q = req.query

  const limitRaw = toIntOrUndefined(q.limit) ?? DEFAULT_LIMIT
  const limit = Math.min(Math.max(limitRaw, 1), MAX_LIMIT)
  const offset = Math.max(toIntOrUndefined(q.offset) ?? 0, 0)

  const tiers = toArray(q.tier as string | string[] | undefined).filter(t => ALLOWED_TIERS.has(t))
  const sort = (typeof q.sort === 'string' && ALLOWED_SORT.has(q.sort) ? q.sort : 'year')

  const filter: PublicationsFilter = {
    search: typeof q.search === 'string' ? q.search : undefined,
    techniques: toArray(q.technique),
    tiers,
    yearFrom: toIntOrUndefined(q.yearFrom),
    yearTo: toIntOrUndefined(q.yearTo),
    rfcxAuthored: q.rfcxAuthored === true || (q.rfcxAuthored as unknown) === 'true',
    limit,
    offset,
    sort
  }

  // cache for 1 hour at the edge (matches the legacy landing endpoint)
  void res.header('Cache-control', 'public s-maxage=3600')
  return await getPublications(filter)
}

export const publicationTechniquesHandler: Handler<PublicationTechnique[]> = async (_, res) => {
  void res.header('Cache-control', 'public s-maxage=3600')
  return await getPublicationTechniques()
}
