import { CoreMediaQuery, CoreMediaResponse } from '@rfcx-bio/common/api-bio/media/core-media'

import { getMedia } from '~/api-core/api-core'
import { Handler } from '~/api-helpers/types'
import { assertInvalidQuery } from '~/validation'

export const coreMediaHandler: Handler<CoreMediaResponse, {}, CoreMediaQuery> = async (req) => {
  // Input & validation
  const { url } = req.query
  if (!url) assertInvalidQuery({ url })

  // Query
  return {
    media: await getMedia(url)
  }
}
