import type { FastifyReply } from 'fastify'

import type { CoreMediaQuery } from '@rfcx-bio/common/api-bio/core-proxy/core-media'

import { getMedia } from '../_services/api-core/api-core'
import type { Handler } from '../_services/api-helpers/types'
import { assertQueryParamsExist } from '../_services/validation'

export const coreMediaHandler: Handler<FastifyReply, unknown, CoreMediaQuery> = async (req, res) => {
  // Input & validation
  const { url } = req.query
  assertQueryParamsExist({ url })

  const media = await getMedia(req.log, url)

  // Query
  return await res.send(media)
}
