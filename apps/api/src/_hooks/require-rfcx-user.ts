import { type Middleware } from '~/api-helpers/types'
import { BioForbiddenError } from '~/errors'

export const requireRfcxEmail: Middleware<void> = async (req): Promise<void> => {
  if (!req.userToken.email.includes('rfcx.org')) {
    throw BioForbiddenError()
  }
}
