import { FastifyReply } from 'fastify'

import { CoreMediaQuery } from '@rfcx-bio/common/api-bio/media/core-media'

import { getMedia } from '../_services/api-core/api-core'
import { Handler } from '../_services/api-helpers/types'
import { assertInvalidQuery } from '../_services/validation'

export const coreMediaHandler: Handler<FastifyReply, {}, CoreMediaQuery> = async (req, res) => {
  // Input & validation
  const { url } = req.query
  if (!url) assertInvalidQuery({ url })

  const media = await getMedia(url)

  // Query
  return await res.send(media)
}
