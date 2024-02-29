import { type Middleware } from '~/api-helpers/types'
import { env } from '~/env'
import { BioUnauthorizedError } from '~/errors'

export const requireSuperUser: Middleware<void> = async (req): Promise<void> => {
  const superUserEmails = env.SUPER_USER_EMAILS ? env.SUPER_USER_EMAILS.split(',') : []
  if (req.userId === undefined || req.userToken?.email === undefined || !superUserEmails.includes(req.userToken?.email)) {
    throw BioUnauthorizedError()
  }
}
